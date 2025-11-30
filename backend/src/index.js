import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.route.js";
import { connect } from "mongoose";
import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Middleware - must be before routes
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log("Server is running on port :" + PORT);
  connectDB();
});
