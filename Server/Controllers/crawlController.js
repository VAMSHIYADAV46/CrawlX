import * as Services from '../Services/Crawl.js'

export async function startCrawl(req,res) {
    let {url,maxDepth,sameDomain} = req.body

    let resp = await Services.Crawl(url,maxDepth,sameDomain)
    
    res.json(resp)
}

