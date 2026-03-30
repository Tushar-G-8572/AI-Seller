import express from 'express'
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import productRouter from './routes/products.route.js';
import cors from 'cors'
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname,'..','public')));

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
}))

app.use('/api/auth',authRouter);
app.use('/api/products',productRouter);

app.use((req,res)=>{
   res.sendFile(path.join(__dirname,'..','public','index.html'));
});

export default app;

