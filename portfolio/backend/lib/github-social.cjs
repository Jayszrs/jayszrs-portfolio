const HEADERS = { Accept: "application/vnd.github+json", "User-Agent": "JaySzrs-Portfolio" };

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

async function request(url, json = true) {
  const response = await fetch(url, { headers: HEADERS, next: { revalidate: 3600 }, signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
  return json ? response.json() : response.text();
}

async function readGitHubSocial(username) {
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username)) throw new Error("Invalid GitHub username");
  const base = `https://api.github.com/users/${encodeURIComponent(username)}`;
  const [profileResult, repoResult, calendarResult] = await Promise.allSettled([
    request(base), request(`${base}/repos?per_page=100&sort=pushed`),
    request(`https://github.com/users/${encodeURIComponent(username)}/contributions`, false),
  ]);
  const profile = profileResult.status === "fulfilled" ? profileResult.value : null;
  const repos = repoResult.status === "fulfilled" && Array.isArray(repoResult.value) ? repoResult.value : [];
  const candidates = repos.filter((repo) => !repo.fork && repo.owner?.login.toLowerCase() === username.toLowerCase()).slice(0, 30);
  let cursor = 0;
  const ranked = [];
  await Promise.all(Array.from({ length: Math.min(candidates.length, 4) }, async () => {
    for (;;) {
      const index = cursor++;
      if (index >= candidates.length) return;
      const repo = candidates[index];
      let commits = null;
      try {
        const contributors = await request(`https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo.name)}/contributors?per_page=100`);
        const contributor = Array.isArray(contributors) && contributors.find((c) => c.login?.toLowerCase() === username.toLowerCase());
        if (contributor) commits = contributor.contributions;
      } catch { /* Keep a repository link when GitHub's rate limit is reached. */ }
      ranked.push({ name: repo.name, url: repo.html_url, description: repo.description, language: repo.language, stars: repo.stargazers_count, commits, pushedAt: repo.pushed_at });
    }
  }));
  const parsedDays = calendarResult.status === "fulfilled" ? parseContributionCalendar(calendarResult.value) : [];
  const days = parsedDays.length >= 300 ? parsedDays : [];
  if (!profile && !ranked.length && !days.length) throw new Error("GitHub is temporarily unavailable");
  return {
    username, profileUrl: `https://github.com/${username}`, avatar: profile?.avatar_url,
    followers: profile?.followers ?? null, repositories: profile?.public_repos ?? null,
    days, totalContributions: days.length ? days.reduce((n, d) => n + d.count, 0) : null,
    topRepositories: ranked.sort((a, b) => (b.commits ?? -1) - (a.commits ?? -1) || (b.stars - a.stars)).slice(0, 5),
    rankedRepositoryCount: candidates.length, updatedAt: new Date().toISOString(),
  };
}

module.exports = { parseContributionCalendar, readGitHubSocial };
