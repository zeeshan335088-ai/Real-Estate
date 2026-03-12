import express from 'express'
import mongoose from 'mongoose';
import dotenv from 'dotenv'
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js'
import listingRouter from './routes/listing.route.js'

dotenv.config();

mongoose.connect(process.env.MONGO)
  .then(()=> console.log("Connected to MongoDB!"))
  .catch((err)=> console.log(err));

const app = express();

// Parse JSON and cookies
app.use(express.json());
app.use(cookieParser());

// ✅ Add CORS here BEFORE routes
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Routes
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter);

// Global error handler
app.use((err, req, res, next)=>{
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success:false,
    statusCode,
    message,
  });
});

app.listen(3000,()=> console.log("Server is running on 3000"));