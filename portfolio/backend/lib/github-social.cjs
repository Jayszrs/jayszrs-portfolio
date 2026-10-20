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
    markdown: text.split(/^#{1,3}[^\n]*(?:GitHub Stats|Top Contributed Repo)[^\n]*$/im)[0].replace(/(?:<br\s*\/?\s*>\s*)+/gi, "\n\n").trim(),
    blocks: intro.map((body, index) => ({ label: labels[index], body })),
    technologies,
  };
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
  const [profileResult, readmeResult] = await Promise.allSettled([
    read(base),
    (async () => {
      try {
        const result = await read(`https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(username)}/readme`);
        if (result.encoding !== "base64" || typeof result.content !== "string") throw new Error("README unavailable");
        return Buffer.from(result.content, "base64").toString("utf8");
      } catch {
        return read(`https://raw.githubusercontent.com/${encodeURIComponent(username)}/${encodeURIComponent(username)}/HEAD/README.md`, false);
      }
    })(),
  ]);
  const profile = profileResult.status === "fulfilled" ? profileResult.value : null;
  const markdown = readmeResult.status === "fulfilled" ? readmeResult.value : "";
  const readme = markdown ? parseProfileReadme(markdown, username) : null;
  if (!profile && !readme) throw new Error("GitHub is temporarily unavailable");
  return {
    username, profileUrl: `https://github.com/${username}`, avatar: profile?.avatar_url,
    name: profile?.name || profile?.login, bio: profile?.bio,
    company: profile?.company, location: profile?.location, readme,
    updatedAt: new Date().toISOString(),
  };
}

module.exports = { parseProfileReadme, readGitHubSocial };
