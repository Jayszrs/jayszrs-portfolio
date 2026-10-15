function normalizedTitle(value = "") {
  return value.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function applyCertificateImport(content, plan) {
  const result = structuredClone(content);
  for (const patch of plan.patches) {
    const index = result[patch.collection].findIndex((item) => item.id === patch.id);
    if (index < 0) throw new Error(`Existing certificate was removed or changed: ${patch.id}`);
    result[patch.collection][index] = { ...result[patch.collection][index], ...patch.fields };
  }
  for (const item of plan.additions) {
    const exists = result.certificates.some((existing) => existing.id === item.id ||
      normalizedTitle(existing.title) === normalizedTitle(item.title) ||
      (item.credentialUrl && existing.credentialUrl === item.credentialUrl));
    if (!exists) result.certificates.push(structuredClone(item));
  }
  return result;
}

module.exports = { applyCertificateImport };
