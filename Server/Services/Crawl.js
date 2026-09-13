import * as cheerio from "cheerio";
import axios from "axios";


export async function Crawl({ url, maxDepth, sameDomain }) {
  let visited = new Set();
  let queue = new Map();

  queue.set(url, 0);
  const startUrl = new URL(url);
  const startDomain = startUrl.hostname;
  console.log(`Domain : ${startDomain}`);

  let result = [];

  while (queue.size != 0) {
    try {
      let [currentUrl, currentDepth] = queue.entries().next().value;
      queue.delete(currentUrl);

      console.log("Queue item:", currentUrl, currentDepth);
      if (!currentUrl) {
        throw new Error("Invalid Url");
      }
      let currentUrlDomain = new URL(currentUrl).hostname;

      if (
        !visited.has(currentUrl) &&
        currentDepth <= maxDepth &&
        (!sameDomain || startDomain === currentUrlDomain)
      ) {
        console.log("Crawling:", currentUrl, "Depth:", currentDepth);

        const response = await axios.get(currentUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36",
          },
        });

        visited.add(currentUrl);

        const html = response.data;
        const $ = cheerio.load(html);

        let uniqueUrls = new Set();

        let title = $("title").text().trim();

        $("a").each((ind, element) => {
          let link = $(element).attr("href");

          if (link) {
            try {
              let checkedUrl = new URL(link, currentUrl);
              if (
                (checkedUrl.protocol == "https:" ||
                  checkedUrl.protocol == "http:") &&
                currentDepth < maxDepth
              ) {
                uniqueUrls.add(checkedUrl.href);

                if (
                  !visited.has(checkedUrl.href) &&
                  !queue.has(checkedUrl.href)
                ) {
                  queue.set(checkedUrl.href, currentDepth + 1);

                  // console.log(
                  //   "Adding:",
                  //   checkedUrl.href,
                  //   "Depth:",
                  //   currentDepth + 1
                  // );
                }
              }
            } catch (error) {
              console.log("Skipping invalid URL:", link);
            }
          }
        });

        result.push({
          url: currentUrl,
          title: title,
          urls: [...uniqueUrls],
        });
      }
    } catch (error) {
      console.log("Actual error:", error);
      throw new Error(`Caught error while crawling : ${error.message}`);
    }
  }

  return {
    success: true,
    url: url,
    pages: result,
  };
}
