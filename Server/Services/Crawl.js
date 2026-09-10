import * as cheerio from 'cheerio'
import axios from 'axios'

// export async function Crawl(url){

// try {
//     if(!url){
//         throw new Error("Invalid Url")
//     }
//     const response = await axios.get(url)

//     const html = response.data

//     const $ = cheerio.load(html)

//     let title = $('title').text().trim()

//     return title
// } catch (error) {
//     return `Caught error while crawling : ${error.message}`
// }

// }


export async function Crawl(url) {
    try {
        console.log(`URL from Services.Crawl : ${url}`)
    } catch (error) {
        console.log(`Error from Services.Crawl : ${error.message}`)
    }
}