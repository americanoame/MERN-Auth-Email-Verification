import User from "../models/userModel.js";
import asyncHandler from "../middleware/asyncHandler.js"
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";


export const signup = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body; // get the name, email, and password from the request body
  
    try {
      if (!email || !password || !name) {
        // check if the email, password, and name are provided
        throw new Error({ message: "Please fill in all fields" }); // throw an error if any of the fields are missing
      }
      const userExists = await User.findOne({ email }); // check if the user already exists in the database
      if (userExists) {
        // if the user already exists
        return res // return an error message
          .status(400)
          .json({ success: false, message: "User already exists" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const verificationToken = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
  
      const user = await User.create({
        email,
        password: hashedPassword,
        name,
        verificationToken,
        verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      });
  
      await user.save();
  
      generateTokenAndSetCookie(res, user._id);
  
    //   await sendVerificationEmail(user.email, verificationToken);
  
      res.status(201).json({
        success: true,
        message: "User created successfull",
        user: {
          ...user._doc, // this will return all the fields in the user object
          password: undefined, // we don't want to return the password
        },
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });


  export const signin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid credentials" });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid credentials" });
      }
  
      generateTokenAndSetCookie(res, user._id);
  
      user.lastLogin = new Date();
      await user.save();
  
      res.status(200).json({
        success: true,
        message: "Logged in successfully",
        user: {
          ...user._doc,
          password: undefined,
        },
      });
    } catch (error) {
      console.log("Error in login ", error);
      res.status(400).json({ success: false, message: error.message });
    }
  });
  

export const logout = asyncHandler(async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  });
  