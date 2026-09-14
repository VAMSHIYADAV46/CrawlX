import fetchPage  from "./fetchPage.js";
import extractLinks from "./extractLinks.js";

export async function Crawl({ url, maxDepth, sameDomain }) {
  let visited = new Set();
  let queue = new Map();

  queue.set(url, 0);
  const startUrl = new URL(url);
  const startDomain = startUrl.hostname;

  let result = [];

  while (queue.size != 0) {
    try {
      let [currentUrl, currentDepth] = queue.entries().next().value;
      queue.delete(currentUrl);

      let storedLinks = new Set();

      
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

        const html = await fetchPage(currentUrl);

        visited.add(currentUrl);

        const {title , links} = extractLinks(html,currentUrl)


        links.forEach((link) => {
          try {


            if (
              currentDepth < maxDepth &&
              !visited.has(link) &&
              !queue.has(link)
            ) {

              queue.set(link, currentDepth + 1);
              storedLinks.add(link)
              

              // console.log(
              //   "Adding:",
              //   link,
              //   "Depth:",
              //   currentDepth + 1
              // );
            }
          } catch (error) {
            console.log(`Caught error while iterating links at crawling : ${error.message}`)
          }
        });

        result.push({
          url: currentUrl,
          title: title,
          urls: [...storedLinks],
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
