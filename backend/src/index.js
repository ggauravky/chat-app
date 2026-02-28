// Force IPv4-first DNS resolution - fixes Node.js 18+ defaulting to IPv6 (::1),
// which breaks MongoDB Atlas SRV lookups (querySrv ECONNREFUSED) and
// causes EADDRINUSE on ::1 instead of 127.0.0.1.
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
// Use Google & Cloudflare DNS directly - ISP/system DNS often blocks SRV queries
// needed by MongoDB Atlas (mongodb+srv://) connection strings.
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "10mb" })); // Increased limit for image uploads
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? true // Allow same origin for Render deployment
        : "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.join(__dirname, "../../frontend/dist");

  app.use(express.static(frontendDistPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

// Start server with automatic port retry on conflict
const BASE_PORT = parseInt(process.env.PORT, 10) || 5001;
const MAX_PORT_RETRIES = 10;
// Use 127.0.0.1 explicitly in development to avoid IPv6 localhost issues
const HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";

const startServer = (port, retriesLeft) => {
  const serverInstance = server.listen(port, HOST, () => {
    console.log(`✅ Server running on http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${port}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
    connectDB();
  });

  serverInstance.on("error", (err) => {
    if (err.code === "EADDRINUSE" && retriesLeft > 0) {
      const nextPort = port + 1;
      console.warn(`⚠️  Port ${port} is already in use. Trying ${nextPort}...`);
      startServer(nextPort, retriesLeft - 1);
      return;
    }

    console.error("❌ Server failed to start:", err.message);
    process.exit(1);
  });
};

startServer(BASE_PORT, MAX_PORT_RETRIES);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err.message);
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
});

// Handle SIGTERM for graceful shutdown
process.on("SIGTERM", () => {
  console.log("⚠️  SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});
