import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // "text" or "image"
    type: {
      type: String,
      enum: ["text", "image"],
      required: true,
    },
    content: {
      type: String, // image URL or text body
      required: true,
    },
    // Background color for text stories
    bgColor: {
      type: String,
      default: "#1a1a2e",
    },
    // Stories expire after 24 hours
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: { expires: 0 }, // MongoDB TTL — auto-delete after expiresAt
    },
    // Who has viewed this story
    viewedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Story = mongoose.model("Story", storySchema);

export default Story;
