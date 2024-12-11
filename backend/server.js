dotenv.config();
import express from 'express';
import dotenv from "dotenv";  
import cors from 'cors';
import connectDB from "./config/db.js";
import authRoute from "./routes/authRoute.js"

const port = process.env.PORT || 3000;

connectDB();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// Body parser middleware to parse the body of the request (req.body)
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies


app.use("/api/auth", authRoute);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});