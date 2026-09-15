export default function normalizeUrl(url) {
  const parsedUrl = new URL(url);

  
  parsedUrl.hash = "";

  
  if (parsedUrl.pathname !== "/") {
    parsedUrl.pathname = parsedUrl.pathname.replace(/\/$/, "");
  }

  return parsedUrl.href;
}