import User from "../models/userModel.js";
import asyncHandler from "../middleware/asyncHandler.js"
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
} from "../mailtrap/emails.js";


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
  
      await sendVerificationEmail(user.email, verificationToken);
  
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



  export const verifyEmail = asyncHandler(async (req, res) => {
    const { code } = req.body;
  
    try {
      console.log("Request token:", code);
  
      const user = await User.findOne({
        verificationToken: code,
        verificationTokenExpiresAt: { $gt: Date.now() },
      });
  
      if (!user) {
        return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
      }
  
      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpiresAt = undefined;
      await user.save();
  
      await sendWelcomeEmail(user.email, user.name);
  
      res.status(200).json({
        success: true,
        message: "Email verified successfully",
        user: {
          ...user._doc,
          password: undefined,
        },
      });
    } catch (error) {
      console.log("error in verifyEmail ", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });


  export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "User not found" });
      }
  
      const resetToken = crypto.randomBytes(20).toString("hex");
      const resetPasswordExpire = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
  
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpiresAt = resetPasswordExpire;
  
      await user.save();
  
      await sendPasswordResetEmail(
        user.email,
        `${process.env.CLIENT_URL}/reset-password/${resetToken}`
      );
  
      res
        .status(200)
        .json({ success: true, message: "Password reset email sent" });
    } catch (error) {
      console.log("Error in forgotPassword ", error);
      res.status(400).json({ success: false, message: error.message });
    }
  });


  export const resetPassword = asyncHandler(async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;
  
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpiresAt: { $gt: Date.now() },
      });
  
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired reset token" });
      }
  
      // update password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiresAt = undefined;
      await user.save();
  
      await sendResetSuccessEmail(user.email);
  
      res
        .status(200)
        .json({ success: true, message: "Password reset successful" });
    } catch (error) {
      console.log("Error in resetPassword ", error);
      res.status(400).json({ success: false, message: error.message });
    }
  });


  

  export const checkAuth = asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.userId).select("-password");
  
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "User not found" });
      }
  
      res.status(200).json({ success: true, user });
    } catch (error) {
      console.log("Error in checkAuth ", error);
      res.status(400).json({ success: false, message: error.message });
    }
  });


  

export const logout = asyncHandler(async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  });
  