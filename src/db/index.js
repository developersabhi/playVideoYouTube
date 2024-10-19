import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async() =>{
    try {
       const connectionInstance =
        await mongoose.connect(process.env.MONGODB_URI,{})
        
        console.log(`MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("MongoDb connection Error from db",error);
        process.exit(1)
    }
}

export default connectDB