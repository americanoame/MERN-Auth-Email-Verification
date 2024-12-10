dotenv.config();
import express from 'express';
import dotenv from "dotenv";  
import cors from 'cors';
import connectDB from "./config/db.js";

const port = process.env.PORT || 3000;

connectDB();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.get('/', (req, res) => {
  res.send({ fruits: ['apple', 'banana', 'cherry'] });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});