import * as cheerio from "cheerio";
import axios from "axios";
import {popFromSet} from '../utilities'

export async function Crawl({ url, maxDepth, sameDomain }) {
  let visited = new Set();
  let queue = new Set();
  queue.add(url)
  

  while(queue.size != 0){
  try {
    let currentUrl = popFromSet(queue)
    if (!currentUrl) {
      throw new Error("Invalid Url");
    }
    if (!visited.has(currentUrl)) {
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
          let checkedUrl = new URL(link, currentUrl);
          uniqueUrls.add(checkedUrl.href);
          queue.add(checkedUrl.href)
        }
      });
    }
  }
  
  
  
  catch (error) {
    throw new Error(`Caught error while crawling : ${error.message}`);
  }
}
}

// return {
//   success: true,
//   url: url,
//   title: title,
//   uniqueUrls: [...uniqueUrls]
// };
