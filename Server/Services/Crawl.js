import fetchPage from "./fetchPage.js";
import extractLinks from "./extractLinks.js";

export async function Crawl({ url, maxDepth, sameDomain }) {
  let visited = new Set();
  let queue = new Map();
  let discoveredUrls = new Set(); // only for stats

  queue.set(url, 0);
  discoveredUrls.add(url);
  const startUrl = new URL(url);
  const startDomain = startUrl.hostname;

  let result = [];

  const startTimestamp = Date.now();
  const startTimeStr = new Date(startTimestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  while (queue.size != 0) {
    let [currentUrl, currentDepth] = queue.entries().next().value;
    try {
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

        const { title, links } = extractLinks(html, currentUrl);

        links.forEach((link) => {
          if (
            currentDepth < maxDepth &&
            !visited.has(link) &&
            !queue.has(link)
          ) {
            queue.set(link, currentDepth + 1);
            discoveredUrls.add(link);
            storedLinks.add(link);

            // console.log(
            //   "Adding:",
            //   link,
            //   "Depth:",
            //   currentDepth + 1
            // );
          }
        });

        result.push({
          url: currentUrl,
          title: title,
          urls: [...storedLinks],
        });
      }
    } catch (error) {
      console.log(`Failed to Fetch URL : ${currentUrl}`);
      if (error.response) {
        console.log(`Failed to Fetch because : ${error.response.status}`);
      }
      result.push({
        url: currentUrl,
        error: error.message,
        status: error.response ? error.response.status : null,
      });
    }
  }

  const endTimestamp = Date.now();
  const endTimeStr = new Date(endTimestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  console.log(startTimeStr);
  console.log(endTimeStr);

  const elapsedMs = endTimestamp - startTimestamp;

  // Convert to seconds and minutes
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  console.log(`Time took: ${elapsedMs} ms`);
  console.log(`Time took: ${minutes}m ${seconds}s`);

  let pagesProcessed = result.length;

  let successfulPages = result.filter((page) => !page.error).length;

  let failedPages = result.filter((page) => page.error).length;

  let discoveredUrlsCount = discoveredUrls.size;

  let timeDuration = `Time took: ${minutes}m ${seconds}s`;

  let stats = {
    pagesProcessed,
    successfulPages,
    failedPages,
    discoveredUrlsCount,
    timeDuration,
  };

  return {
    success: true,
    url: url,
    pages: result,
    stats: stats,
  };
}
