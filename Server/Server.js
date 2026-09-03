import express from 'express'

const Port = 8080
const app = express()


app.get("/",(req,res)=>{
    res.send("<h1>You Hit Home Route</h1>")
})

app.listen(Port,()=>{
    console.log(`Server is running on port : ${Port}`)
})