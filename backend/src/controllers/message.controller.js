import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const me = await User.findById(loggedInUserId);
    const blockedIds = me.blockedUsers || [];

    // Exclude blocked users AND users who blocked us
    const usersWhoBlockedMe = await User.find({ blockedUsers: loggedInUserId }).select("_id");
    const excludedIds = [
      ...blockedIds.map((id) => id.toString()),
      ...usersWhoBlockedMe.map((u) => u._id.toString()),
    ];

    const users = await User.find({
      _id: { $ne: loggedInUserId, $nin: excludedIds },
    }).select("-password");

    const usersWithMeta = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: loggedInUserId, receiverId: user._id },
            { senderId: user._id, receiverId: loggedInUserId },
          ],
          deletedFor: { $ne: loggedInUserId },
        })
          .sort({ createdAt: -1 })
          .select("text image createdAt senderId isDeleted");

        const unreadCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: loggedInUserId,
          status: { $ne: "read" },
          deletedFor: { $ne: loggedInUserId },
          isDeleted: false,
        });

        const isMuted = (me.mutedChats || []).some(
          (id) => id.toString() === user._id.toString()
        );

        return {
          ...user.toObject(),
          lastMessage: lastMessage || null,
          unreadCount,
          isMuted,
        };
      })
    );

    res.status(200).json(usersWithMeta);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    // Pagination: ?before=<messageId>&limit=30 (default 30)
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);
    const before = req.query.before; // cursor: load messages older than this id

    const filter = {
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
      deletedFor: { $ne: myId },
    };

    if (before) {
      // Find messages older than the cursor id
      const cursorMsg = await Message.findById(before).select("createdAt");
      if (cursorMsg) filter.createdAt = { $lt: cursorMsg.createdAt };
    }

    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("replyTo", "text image senderId isDeleted");

    // Return in chronological order
    res.status(200).json(messages.reverse());
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, replyTo } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Check if receiver is online → deliver immediately
    const receiverSocketId = getReceiverSocketId(receiverId);
    const initialStatus = receiverSocketId ? "delivered" : "sent";

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      replyTo: replyTo || null,
      status: initialStatus,
    });

    await newMessage.save();

    // Populate replyTo before broadcasting
    await newMessage.populate("replyTo", "text image senderId isDeleted");

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark all messages from a sender as read
export const markMessagesRead = async (req, res) => {
  try {
    const { id: senderId } = req.params;  // the other person
    const myId = req.user._id;

    await Message.updateMany(
      { senderId, receiverId: myId, status: { $ne: "read" } },
      { status: "read" }
    );

    // Notify the sender via socket that their messages were read
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", { readBy: myId.toString() });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error in markMessagesRead: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete message for me OR for everyone
export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { deleteFor } = req.body; // "me" | "everyone"
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (deleteFor === "everyone") {
      // Only sender can delete for everyone
      if (message.senderId.toString() !== userId.toString()) {
        return res.status(403).json({ error: "You can only delete your own messages for everyone" });
      }
      message.isDeleted = true;
      message.text = null;
      message.image = null;
      await message.save();

      // Notify the other party
      const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageDeleted", { messageId, deleteFor: "everyone" });
      }
    } else {
      // Delete for me only
      message.deletedFor.addToSet(userId);
      await message.save();
    }

    res.status(200).json({ success: true, message });
  } catch (error) {
    console.log("Error in deleteMessage: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
