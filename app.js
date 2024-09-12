import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import userRoutes from './routes/userRoute.js';

dotenv.config();

const app = express();
const port = 4050;

app.use(bodyParser.json());

app.use('/api/users',userRoutes);

mongoose.connect(process.env.DATABASE_URL).then(()=>console.log("mongo db connected")).catch(err => console.error(err));


app.listen(port,()=>{
   console.log( `server is listening at ${port}`)
})