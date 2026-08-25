import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import * as cheerio from 'cheerio'
import crypto from 'node:crypto'

const app = express()
const port = Number(process.env.PORT || 5000)
const memoryCrawls = new Map()
const memoryResults = new Map()
let mongoReady = false

app.use(cors({ origin: true }))
app.use(express.json({ limit: '1mb' }))

const crawlSchema = new mongoose.Schema({
  startUrl: String, status: { type: String, default: 'queued' }, maxDepth: Number,
  sameDomainOnly: Boolean, queue: [String], visited: [String], pagesCrawled: Number,
  pagesFailed: Number, startedAt: Date, completedAt: Date,
}, { timestamps: true })
const resultSchema = new mongoose.Schema({
  crawlId: { type: mongoose.Schema.Types.ObjectId, index: true }, url: String,
  title: String, description: String, headings: [String], links: [String],
  metadata: mongoose.Schema.Types.Mixed, crawledAt: Date,
})
const Crawl = mongoose.model('Crawl', crawlSchema)
const ScrapedData = mongoose.model('ScrapedData', resultSchema)

function normalizeUrl(value) {
  const parsed = new URL(String(value).trim())
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Only HTTP and HTTPS URLs are supported.')
  parsed.hash = ''
  return parsed.toString()
}
function idString(id) { return String(id) }
async function saveCrawl(crawl) {
  if (mongoReady) return Crawl.findByIdAndUpdate(crawl._id, crawl, { new: true })
  memoryCrawls.set(idString(crawl._id), { ...crawl })
  return crawl
}
async function createCrawl(data) {
  if (mongoReady) return Crawl.create(data)
  const crawl = { ...data, _id: crypto.randomUUID(), createdAt: new Date(), updatedAt: new Date() }
  memoryCrawls.set(crawl._id, crawl)
  memoryResults.set(crawl._id, [])
  return crawl
}
async function addResult(data) {
  if (mongoReady) return ScrapedData.create(data)
  const row = { ...data, _id: crypto.randomUUID() }
  const rows = memoryResults.get(idString(data.crawlId)) || []
  rows.unshift(row); memoryResults.set(idString(data.crawlId), rows)
  return row
}
async function getCrawl(id) { return mongoReady ? Crawl.findById(id) : memoryCrawls.get(id) }
async function getResults(id) { return mongoReady ? ScrapedData.find({ crawlId: id }).sort({ crawledAt: -1 }) : memoryResults.get(id) || [] }

async function extractPage(url, crawlId) {
  const response = await fetch(url, { headers: { 'User-Agent': 'CrawlX/1.0' }, signal: AbortSignal.timeout(15000) })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const $ = cheerio.load(await response.text())
  const links = [...new Set($('a[href]').map((_, el) => {
    try { const link = new URL($(el).attr('href'), url); link.hash = ''; return link.toString() } catch { return null }
  }).get().filter(Boolean))]
  await addResult({ crawlId, url, title: $('title').first().text().trim(), description: $('meta[name="description"]').attr('content') || '', headings: $('h1,h2,h3').map((_, el) => $(el).text().trim()).get().filter(Boolean), links, metadata: { lang: $('html').attr('lang') || '', canonical: $('link[rel="canonical"]').attr('href') || '' }, crawledAt: new Date() })
  return links
}
async function runCrawl(id) {
  const crawl = await getCrawl(id); if (!crawl) return
  crawl.status = 'crawling'; crawl.startedAt = new Date(); await saveCrawl(crawl)
  const origin = new URL(crawl.startUrl).origin
  const seen = new Set([crawl.startUrl]); const queue = [{ url: crawl.startUrl, depth: 0 }]
  while (queue.length) {
    const current = queue.shift(); crawl.queue = queue.map((item) => item.url); crawl.visited = [...seen]; await saveCrawl(crawl)
    try {
      const links = await extractPage(current.url, id); crawl.pagesCrawled = (crawl.pagesCrawled || 0) + 1
      if (current.depth < crawl.maxDepth) for (const link of links) {
        if (seen.has(link) || (crawl.sameDomainOnly && new URL(link).origin !== origin)) continue
        seen.add(link); queue.push({ url: link, depth: current.depth + 1 })
      }
    } catch { crawl.pagesFailed = (crawl.pagesFailed || 0) + 1 }
    await saveCrawl(crawl)
  }
  crawl.queue = []; crawl.visited = [...seen]; crawl.status = 'completed'; crawl.completedAt = new Date(); await saveCrawl(crawl)
}

app.get('/api/health', (_, res) => res.json({ ok: true, mongo: mongoReady, storage: mongoReady ? 'mongodb' : 'memory' }))
app.post('/api/crawl', async (req, res) => {
  try {
    const startUrl = normalizeUrl(req.body.startUrl)
    const maxDepth = Math.max(0, Math.min(10, Number(req.body.maxDepth ?? 2)))
    const crawl = await createCrawl({ startUrl, maxDepth, sameDomainOnly: req.body.sameDomainOnly !== false, status: 'queued', queue: [startUrl], visited: [], pagesCrawled: 0, pagesFailed: 0 })
    runCrawl(idString(crawl._id)).catch((error) => console.error('[v0] crawl failed:', error.message))
    res.status(201).json(crawl)
  } catch (error) { res.status(400).json({ error: error.message }) }
})
app.get('/api/crawls/:id', async (req, res) => { const crawl = await getCrawl(req.params.id); crawl ? res.json(crawl) : res.status(404).json({ error: 'Crawl not found' }) })
app.get('/api/results', async (req, res) => res.json(await getResults(req.query.crawlId)))
app.get('/api/health', (_, res) => res.json({ ok: true, mongo: mongoReady, storage: mongoReady ? 'mongodb' : 'memory' }))

app.listen(port, '0.0.0.0', () => console.log(`[v0] API ready at http://localhost:${port}`))
if (process.env.MONGODB_URI) mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 }).then(() => { mongoReady = true; console.log('[v0] MongoDB connected') }).catch((error) => console.error('[v0] MongoDB unavailable; using memory storage:', error.message))
else console.warn('[v0] MONGODB_URI missing; using memory storage.')

export default app
