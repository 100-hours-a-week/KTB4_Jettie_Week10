export function toRelativeAssetUrl(url) {
  if (!url || typeof url !== "string") {
    return "";
  }

  if (!/^https?:\/\//i.test(url)) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);
    return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  } catch {
    return url;
  }
}
