// require(".env").config({path:'./env'})
import dotenv  from "dotenv";
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import connectDB from "./db/index.js";
import express from "express";
import { app } from "./app.js";


dotenv.config({
    path: '.env'
})



connectDB().then(()=>{
    app.listen(process.env.PORT || 8001,() =>{
        console.log(`Servver is running at Port 
            : ${process.env.PORT}`)
    } )
}).catch((err)=>{
    console.log("Mongo Db Connection failed ",err)
});



// const app = express();

// app.get('/',(req,res)=>{
//     res.status(201).send("hello Server")
// })

// app.listen(`${process.env.PORT}`,()=>{
//     console.log(`Server is running on ${process.env.PORT}`)
// })

