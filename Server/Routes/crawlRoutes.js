import express from 'express'
import * as crawlController from '../Controllers/crawlController.js' ;


const router = express.Router();

// router.get("/fetch",async(req,res)=>{
//     let {url} = req.query
//     let resp = await Crawl(url)
//     console.log(`Crawling Started at url : ${url}`)
//     res.send("resp : ",resp)
//     console.log("resp : ",resp)
// })

router.post("/crawl",crawlController.startCrawl)

export default router;