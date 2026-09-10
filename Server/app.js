import express from 'express'
import crawlRoutes from './Routes/crawlRoutes.js'


const app = express()


app.use(express.json())
app.use(express.urlencoded({extended:true}))


app.get("/",(req,res)=>{
    res.send("<h1>You Hit Home Route</h1>")
})


app.use("/api", crawlRoutes);


export {app};