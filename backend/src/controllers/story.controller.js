import Story from "../models/story.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io } from "../lib/socket.js";

// POST /api/stories — create a new story
export const createStory = async (req, res) => {
  try {
    const { type, content, bgColor } = req.body;
    const userId = req.user._id;

    if (!type || !content) {
      return res.status(400).json({ message: "type and content are required" });
    }

    let finalContent = content;

    if (type === "image") {
      const upload = await cloudinary.uploader.upload(content, { folder: "stories" });
      finalContent = upload.secure_url;
    }

    const story = await Story.create({
      userId,
      type,
      content: finalContent,
      bgColor: bgColor || "#1a1a2e",
    });

    await story.populate("userId", "fullName profilePic");

    // Broadcast to all connected users
    io.emit("newStory", story);

    res.status(201).json(story);
  } catch (error) {
    console.error("Error in createStory:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/stories — get all non-expired stories for contacts (excludes blocked)
export const getStories = async (req, res) => {
  try {
    const me = await User.findById(req.user._id);
    const blockedIds = me.blockedUsers || [];

    const stories = await Story.find({
      expiresAt: { $gt: new Date() },
      userId: { $nin: blockedIds },
    })
      .sort({ createdAt: -1 })
      .populate("userId", "fullName profilePic");

    res.status(200).json(stories);
  } catch (error) {
    console.error("Error in getStories:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/stories/:id/view — mark a story as viewed
export const viewStory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    await Story.findByIdAndUpdate(id, {
      $addToSet: { viewedBy: userId },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in viewStory:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /api/stories/:id — delete own story
export const deleteStory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const story = await Story.findById(id);
    if (!story) return res.status(404).json({ message: "Story not found" });
    if (story.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not your story" });
    }

    await story.deleteOne();
    io.emit("storyDeleted", { storyId: id, userId: userId.toString() });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in deleteStory:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
