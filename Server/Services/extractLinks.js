import * as cheerio from "cheerio";
import normalizeUrl from "./normalizeUrl";


export default function extractLinks(html, currentUrl) {
  const $ = cheerio.load(html);

  let uniqueUrls = new Set();

  let title = $("title").text().trim();

  $("a").each((ind, element) => {
    let link = $(element).attr("href");

    if (link) {
      try {
        let checkedUrl = new URL(link, currentUrl);

        

        if (checkedUrl.protocol == "https:" || checkedUrl.protocol == "http:") {
          uniqueUrls.add(normalizeUrl(checkedUrl.href));
        }
      } catch (error) {
        console.log("Skipping invalid URL:", link);
      }
    }
  });

  return {
    title,
    links: [...uniqueUrls],
  };
}
