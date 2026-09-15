export default function normalizeUrl(url) {
  if (url.includes("#")) {
    let ind = url.indexOf("#");
    url = url.slice(0, ind);
  }

  if (url[url.length - 1] == "/") {
    url = url.slice(0, url.length - 1);
  }

  url = new URL(url).href;

  return url;
}