import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
        about: newUser.about,
        lastSeen: newUser.lastSeen,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      about: user.about,
      lastSeen: user.lastSeen,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, about } = req.body;
    const userId = req.user._id;

    const updateData = {};

    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updateData.profilePic = uploadResponse.secure_url;
    }

    if (about !== undefined) {
      updateData.about = about;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// POST /api/auth/block/:id
export const blockUser = async (req, res) => {
  try {
    const me = await User.findById(req.user._id);
    const targetId = req.params.id;
    me.blockedUsers.addToSet(targetId);
    await me.save();
    res.status(200).json({ blockedUsers: me.blockedUsers });
  } catch (error) {
    console.log("Error in blockUser:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// DELETE /api/auth/block/:id
export const unblockUser = async (req, res) => {
  try {
    const me = await User.findById(req.user._id);
    me.blockedUsers.pull(req.params.id);
    await me.save();
    res.status(200).json({ blockedUsers: me.blockedUsers });
  } catch (error) {
    console.log("Error in unblockUser:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// POST /api/auth/mute/:id
export const muteChat = async (req, res) => {
  try {
    const me = await User.findById(req.user._id);
    me.mutedChats.addToSet(req.params.id);
    await me.save();
    res.status(200).json({ mutedChats: me.mutedChats });
  } catch (error) {
    console.log("Error in muteChat:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// DELETE /api/auth/mute/:id
export const unmuteChat = async (req, res) => {
  try {
    const me = await User.findById(req.user._id);
    me.mutedChats.pull(req.params.id);
    await me.save();
    res.status(200).json({ mutedChats: me.mutedChats });
  } catch (error) {
    console.log("Error in unmuteChat:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// POST /api/auth/push-subscribe
export const savePushSubscription = async (req, res) => {
  try {
    const { subscription } = req.body;
    await User.findByIdAndUpdate(req.user._id, { pushSubscription: subscription });
    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error in savePushSubscription:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
