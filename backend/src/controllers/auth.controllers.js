import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateToken } from "./../lib/utils.js";
import cloudinaryV2 from "./../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { email, fullname, password } = req.body;
  console.log("Signup request received:", {
    email,
    fullname,
    passwordLength: password?.length,
  });
  try {
    if (!email || !fullname || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "invalid user data" });
    }
  } catch (error) {
    console.log("error in signup:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login request received:", { email, hasPassword: !!password });
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(400).json({ message: "User does not exist" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      console.log("Invalid password for user:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);
    console.log("Login successful for user:", email);
    res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("error in login:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("token", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("error in logout:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userID = req.user._id;
    console.log("Update profile request for user:", userID);

    if (!profilePic) {
      console.log("No profile picture provided");
      return res.status(400).json({ message: "Profile picture is required" });
    }

    console.log("Uploading to Cloudinary...");
    const uploadResponse = await cloudinaryV2.uploader.upload(profilePic);
    console.log("Cloudinary upload successful:", uploadResponse.secure_url);

    const updatedUser = await User.findByIdAndUpdate(
      userID,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    console.log("Profile updated successfully");
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in updateProfile:", error.message);
    console.error("Full error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("error in checkAuth:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
