import User from "../models/user.model.js";
import Message from "../models/message.model.js";

export const getUsersForSidebar=async (req, res) => {
    try {
        const loggedInUserId = req.user.id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error fetching users for sidebar:", error.message);
        res.status(500).json({ message: "Server error" });
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id:userToChatId } = req.params;
        const myId = req.user.id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        })

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error.message);
        res.status(500).json({ message: "Server error" });
    }
}

export const sendMessage = async (req, res) => {
    try {
        const {text , image } = req.body;
        const { id:receiverId } = req.params;
        const senderId = req.user.id;

        let imageUrl;
        if(image){
            const uploadResonse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResonse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        await newMessage.save();

        //update last message in user model -> socket.io will use this to update sidebar in real time
        
        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error sending message:", error.message);
        res.status(500).json({ message: "Server error" });
    }
}