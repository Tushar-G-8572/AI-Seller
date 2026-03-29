import dotenv from 'dotenv';
dotenv.config();
import app from "./src/app.js";
import { connectToDB } from './src/config/db.js';
import http from 'http'
import { initSocketServer } from './src/sockets/socket.server.js';

const httpServer = http.createServer(app);
const port = process.env.PORT;

initSocketServer(httpServer);
connectToDB();

httpServer.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})
