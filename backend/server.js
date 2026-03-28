import dotenv from 'dotenv';
dotenv.config();
import app from "./src/app.js";
import { connectToDB } from './src/config/db.js';


const port = process.env.PORT;


connectToDB();

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})
