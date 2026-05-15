require('dotenv').config();
require('./workers/analyticsWorker');
const cors = require('cors');
const express = require('express');
const url_routes = require("./routes/urlRoutes")

const app = express();
app.use(express.json());
app.use(cors());

app.get("/",(req,res)=>{
    res.send("hello hardik")
})

app.use("/api/v1",url_routes)

const PORT = process.env.SERVER_PORT || 5000 
console.log("SERVER_PORT",process.env.SERVER_PORT)
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
})