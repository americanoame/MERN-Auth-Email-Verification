dotenv.config();
import express from 'express';
import dotenv from "dotenv";  
import cors from 'cors';
import connectDB from "./config/db.js";
import authRoute from "./routes/authRoute.js"
import cookieParser from "cookie-parser";

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

// Cookie parser middleware to parse the cookies from the request object
// alows to acces reqest.cookies and since  the cookie is called JWT we can access it by req.cookies.JWT
// we can do this in the authMiddleware.js file
app.use(cookieParser());


app.use("/api/auth", authRoute);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});