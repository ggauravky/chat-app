<div align="center">

# 💬 Real-Time Chat Application

![Status](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-ISC-yellow?style=for-the-badge)

### 🚀 A modern, full-stack real-time messaging platform built with the MERN stack

### [🌐 Live Demo](https://chat-app-6ly8.onrender.com/) • [📖 Documentation](#-features) • [⚡ Quick Start](#-quick-start)

---

[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)](https://zustand-demo.pmnd.rs/)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [⚡ Quick Start](#-quick-start)
- [🔑 API Endpoints](#-api-endpoints)
- [🚀 Deployment](#-deployment)
- [👨‍💻 Developer](#-developer)

---

## ✨ Features

### 🔐 Authentication & Security

- ✅ JWT-based user authentication
- ✅ Bcrypt password encryption
- ✅ HTTP-only secure cookies
- ✅ Protected routes & middleware

### 💬 Real-time Messaging

- ✅ Instant message delivery with Socket.IO
- ✅ Online/Offline user status
- ✅ Message history & persistence
- ✅ Multi-user chat support

### 🎨 User Interface

- ✅ Modern & responsive design
- ✅ Theme customization support
- ✅ Profile management
- ✅ Image upload via Cloudinary
- ✅ Smooth animations & transitions

---

## 🛠️ Tech Stack

### Frontend

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![DaisyUI](https://img.shields.io/badge/DaisyUI-5A0EF8?style=for-the-badge&logo=daisyui&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io_Client-010101?style=for-the-badge&logo=socket.io&logoColor=white)

### Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Bcrypt](https://img.shields.io/badge/Bcrypt-338033?style=for-the-badge&logo=letsencrypt&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)

### DevOps & Tools

![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)

---

## 📁 Project Structure

```
chat-app/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Database schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth middleware
│   │   ├── lib/            # Utilities (DB, Socket, Cloudinary)
│   │   └── index.js        # Server entry
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/     # React components
    │   ├── pages/          # Page components
    │   ├── store/          # Zustand stores
    │   ├── lib/            # Utilities
    │   └── App.jsx         # Root component
    └── package.json
```

---

## ⚡ Quick Start

### Prerequisites

- Node.js v16+ installed
- MongoDB (local or Atlas)
- Cloudinary account

### Setup Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/ggauravky/chat-app.git
   cd chat-app
   ```

2. **Install dependencies**

   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**

   Create `.env` in the `backend` folder:

   ```env
   PORT=5001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Run the application**

   ```bash
   # Start backend (from backend folder)
   npm run dev

   # Start frontend (from frontend folder, new terminal)
   npm run dev
   ```

5. **Access the app**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5001`

---

## 🔑 API Endpoints

### Authentication

| Method | Endpoint                   | Description       | Auth |
| ------ | -------------------------- | ----------------- | ---- |
| POST   | `/api/auth/signup`         | Register new user | ❌   |
| POST   | `/api/auth/login`          | User login        | ❌   |
| POST   | `/api/auth/logout`         | User logout       | ✅   |
| PUT    | `/api/auth/update-profile` | Update profile    | ✅   |
| GET    | `/api/auth/check`          | Check auth status | ✅   |

### Messages

| Method | Endpoint                 | Description            | Auth |
| ------ | ------------------------ | ---------------------- | ---- |
| GET    | `/api/messages/users`    | Get all users          | ✅   |
| GET    | `/api/messages/:id`      | Get messages with user | ✅   |
| POST   | `/api/messages/send/:id` | Send message           | ✅   |

---

## 🚀 Deployment

### Live Application

The application is deployed and accessible at:

**🌐 [https://chat-app-6ly8.onrender.com](https://chat-app-6ly8.onrender.com/)**

### Deployment Platform

- **Platform:** Render
- **Frontend & Backend:** Deployed as a monorepo
- **Database:** MongoDB Atlas
- **Image Storage:** Cloudinary

> **Note:** The app may take a few seconds to load initially due to Render's free tier cold start.

---

## 👨‍💻 Developer

**Gaurav Kumar**

[![GitHub](https://img.shields.io/badge/GitHub-ggauravky-181717?style=for-the-badge&logo=github)](https://github.com/ggauravky)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/ggauravky)

---

## 📝 License

This project is licensed under the **ISC License**.

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ using the MERN Stack

![Made with MERN](https://img.shields.io/badge/Made%20with-MERN%20Stack-brightgreen?style=for-the-badge)

</div>
