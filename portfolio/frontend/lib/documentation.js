export function compactUrls(values = []) {
  const seen = new Set();

  return values
    .map((value) => String(value || "").trim())
    .filter((value) => {
      if (!value || seen.has(value)) return false;
      seen.add(value);
      return true;
    });
}

export function documentationImages(item = {}) {
  return compactUrls([
    ...(Array.isArray(item.documentationImages) ? item.documentationImages : []),
    item.documentationImage,
    item.documentationImage2,
    item.documentationImage3,
  ]);
}

export function withDocumentationImages(item = {}, images = []) {
  const docs = compactUrls(images);

  return {
    ...item,
    documentationImages: docs,
    documentationImage: docs[0] || "",
    documentationImage2: docs[1] || "",
    documentationImage3: docs[2] || "",
  };
}
