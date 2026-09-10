import * as cheerio from 'cheerio'
import axios from 'axios'

export async function Crawl(url){

try {
    if(!url){
        throw new Error("Invalid Url")
    }
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36",
      },
    });

    const html = response.data

    const $ = cheerio.load(html)

    let title = $('title').text().trim()

    return {
      success: true,
      url: url,
      title: title
    };
} catch (error) {
    throw new Error(`Caught error while crawling : ${error.message}`)
}
}


// export async function Crawl(url,maxDepth,sameDomain) {
//     try {
        
//     } catch (error) {
//         console.log(`Error from Services.Crawl : ${error.message}`)
//     }
// }