import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    about: {
      type: String,
      default: "Hey there! I am using Zapp.",
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    // Users this person has blocked
    blockedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    // Conversations this person has muted (stores the OTHER user's id)
    mutedChats: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    // Web Push subscription object
    pushSubscription: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
