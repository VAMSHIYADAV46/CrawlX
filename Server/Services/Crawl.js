import * as cheerio from "cheerio";
import axios from "axios";

export async function Crawl({ url, maxDepth, sameDomain }) {
  let visited = new Set();

  try {
    if (!url) {
      throw new Error("Invalid Url");
    }
    if (!visited.has(url)) {
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36",
        },
      });
      visited.add(url);

      const html = response.data;

      const $ = cheerio.load(html);

      let uniqueUrls = new Set();

      let title = $("title").text().trim();
      $("a").each((ind, element) => {
        let link = $(element).attr("href");
        if (link) {
          let checkedUrl = new URL(link, url);
          uniqueUrls.add(checkedUrl.href);
        }
      });
    }
  } catch (error) {
    throw new Error(`Caught error while crawling : ${error.message}`);
  }
}

// return {
//   success: true,
//   url: url,
//   title: title,
//   uniqueUrls: [...uniqueUrls]
// };
