import express from 'express';
import dotenv from 'dotenv';
import dbConnection from './database/dbConnection.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { errorMiddleware } from './middlewares/error.js';
import userRoutes from './routes/user.routes.js';

const app = express();
dotenv.config({path: './config/.env'});

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/user', userRoutes);

dbConnection();

app.use(errorMiddleware);

export default app;