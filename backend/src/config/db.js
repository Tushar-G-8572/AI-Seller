import dotenv from 'dotenv';
dotenv.config();
import mongoose from "mongoose";

export async function connectToDB() {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");
    }catch(err){
        console.error(err);
        process.exit(1);
    }
}