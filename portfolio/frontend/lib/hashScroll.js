export function scrollToTarget(targetHash, attempt = 0) {
  const target = document.getElementById(targetHash);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    return true;
  }

  if (attempt < 24) {
    window.setTimeout(() => scrollToTarget(targetHash, attempt + 1), 60);
  }

  return false;
}
