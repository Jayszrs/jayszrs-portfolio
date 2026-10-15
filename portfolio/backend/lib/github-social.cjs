const HEADERS = { Accept: "application/vnd.github+json", "User-Agent": "JaySzrs-Portfolio" };

function plainText(value = "") {
  return value.replace(/<[^>]*>/g, " ").replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_`]/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/\s+/g, " ").trim().slice(0, 1400);
}

function parseProfileReadme(markdown, username) {
  const text = String(markdown || "").slice(0, 100000);
  const intro = text.split(/^#{1,3}\s.*(?:Socials|Tech Stack|GitHub Stats)/im)[0]
    .replace(/^#{1,6}.*$/gm, "").split(/<br\s*\/?\s*>|\n\s*\n/gi)
    .map(plainText).filter(Boolean).slice(0, 6);
  const labels = ["Sedang dibangun", "Terbuka berkolaborasi", "Eksplorasi berikutnya", "Sedang dipelajari", "Mari bertukar ide", "Di balik kode"];
  const techSection = /#{1,3}[^\n]*Tech Stack[^\n]*\n([\s\S]*?)(?=\n#{1,3}\s|$)/i.exec(text)?.[1] || "";
  const technologies = [...new Set([...techSection.matchAll(/!\[([^\]]{1,70})\]\(https:\/\/img\.shields\.io\/[^)]+\)/g)].map((match) => plainText(match[1])))].slice(0, 100);
  return {
    sourceUrl: `https://github.com/${username}/${username}#readme`,
    blocks: intro.map((body, index) => ({ label: labels[index], body })),
    technologies,
  };
}

function parseContributionCalendar(html) {
  const tips = new Map();
  for (const match of html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g)) {
    const id = /\bfor="([^"]+)"/.exec(match[1])?.[1];
    const text = match[2].replace(/<[^>]*>/g, "").trim();
    const count = /^([\d,]+)\s+contribution/.exec(text);
    if (id && (count || /^No contributions\b/.test(text))) tips.set(id, count ? Number(count[1].replace(/,/g, "")) : 0);
  }
  const days = [];
  for (const match of html.matchAll(/<(?:td|rect)\b([^>]*\bdata-date="\d{4}-\d{2}-\d{2}"[^>]*)>/g)) {
    const attrs = match[1];
    const date = /data-date="([^"]+)"/.exec(attrs)?.[1];
    const id = /\bid="([^"]+)"/.exec(attrs)?.[1];
    const level = Number(/data-level="(\d)"/.exec(attrs)?.[1]);
    if (date && id && tips.has(id) && level >= 0 && level <= 4) days.push({ date, count: tips.get(id), level });
  }
  return days.sort((a, b) => a.date.localeCompare(b.date));
}

async function request(url, json = true, signal) {
  const response = await fetch(url, { headers: HEADERS, next: { revalidate: 3600 }, signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(12000)]) : AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
  return json ? response.json() : response.text();
}

async function readGitHubSocial(username) {
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username)) throw new Error("Invalid GitHub username");
  const budget = AbortSignal.timeout(20000);
  const read = (url, json = true) => request(url, json, budget);
  const base = `https://api.github.com/users/${encodeURIComponent(username)}`;
  const [profileResult, repoResult, calendarResult, readmeResult] = await Promise.allSettled([
    read(base), read(`${base}/repos?per_page=100&sort=pushed`),
    read(`https://github.com/users/${encodeURIComponent(username)}/contributions`, false),
    read(`https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(username)}/readme`),
  ]);
  const profile = profileResult.status === "fulfilled" ? profileResult.value : null;
  const repos = repoResult.status === "fulfilled" && Array.isArray(repoResult.value) ? repoResult.value : [];
  const candidates = repos.filter((repo) => !repo.fork && (repo.owner?.login || "").toLowerCase() === username.toLowerCase()).slice(0, 30);
  let cursor = 0;
  const ranked = [];
  await Promise.all(Array.from({ length: Math.min(candidates.length, 4) }, async () => {
    for (;;) {
      const index = cursor++;
      if (index >= candidates.length || budget.aborted) return;
      const repo = candidates[index];
      let commits = null;
      try {
        const contributors = await read(`https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo.name)}/contributors?per_page=100`);
        const contributor = Array.isArray(contributors) && contributors.find((c) => c.login?.toLowerCase() === username.toLowerCase());
        if (contributor) commits = contributor.contributions;
      } catch { /* Keep a repository link when GitHub's rate limit is reached. */ }
      ranked.push({ name: repo.name, url: repo.html_url, description: repo.description, language: repo.language, stars: repo.stargazers_count, commits, pushedAt: repo.pushed_at });
    }
  }));
  const parsedDays = calendarResult.status === "fulfilled" ? parseContributionCalendar(calendarResult.value) : [];
  const days = parsedDays.length >= 300 ? parsedDays : [];
  const markdown = readmeResult.status === "fulfilled" && readmeResult.value?.encoding === "base64" && typeof readmeResult.value.content === "string"
    ? Buffer.from(readmeResult.value.content, "base64").toString("utf8") : "";
  const readme = markdown ? parseProfileReadme(markdown, username) : null;
  if (!profile && !ranked.length && !days.length && !readme) throw new Error("GitHub is temporarily unavailable");
  const verified = ranked.filter((repo) => repo.commits !== null);
  return {
    username, profileUrl: `https://github.com/${username}`, avatar: profile?.avatar_url,
    name: profile?.name || profile?.login || username, bio: profile?.bio || "",
    company: profile?.company || "", location: profile?.location || "", readme,
    followers: profile?.followers ?? null, repositories: profile?.public_repos ?? null,
    days, totalContributions: days.length ? days.reduce((n, d) => n + d.count, 0) : null,
    topRepositories: verified.length
      ? verified.sort((a, b) => b.commits - a.commits || b.stars - a.stars).slice(0, 5)
      : ranked.sort((a, b) => String(b.pushedAt).localeCompare(String(a.pushedAt))).slice(0, 5),
    rankingKind: verified.length ? "owner-commits" : "recent-repositories",
    verifiedRepositoryCount: verified.length,
    rankedRepositoryCount: candidates.length, updatedAt: new Date().toISOString(),
  };
}

module.exports = { parseContributionCalendar, parseProfileReadme, readGitHubSocial };
