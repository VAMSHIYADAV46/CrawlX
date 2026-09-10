import * as Services from '../Services/Crawl.js'

export async function startCrawl(req,res) {
    let {url} = req.query

    Services.Crawl(url)
}

