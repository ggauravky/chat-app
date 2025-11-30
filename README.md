<div align="center">

# 💬 Real-Time Chat Application

![Chat App Banner](https://img.shields.io/badge/Chat-Application-blueviolet?style=for-the-badge&logo=wechat&logoColor=white)

### 🚀 A modern, full-stack chat application built with the MERN stack

[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-getting-started) • [API](#-api-endpoints) • [Roadmap](#-roadmap)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔐 Authentication & Security

- JWT-based user registration & login
- Bcrypt password encryption
- HTTP-only cookie sessions
- Secure token management

</td>
<td width="50%">

### 💬 Real-time Communication

- Instant messaging with Socket.IO
- Real-time message delivery
- Live connection status
- Seamless user experience

</td>
</tr>
<tr>
<td width="50%">

### 🎨 Modern Interface

- React 19 powered UI
- Lightning-fast Vite build
- Clean & intuitive design
- Smooth animations

</td>
<td width="50%">

### 📱 Responsive Design

- Mobile-first approach
- Cross-device compatibility
- Adaptive layouts
- Touch-friendly interface

</td>
</tr>
</table>

## 🛠️ Tech Stack

<details open>
<summary><b>Frontend</b></summary>
<br/>

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)

</details>

<details open>
<summary><b>Backend</b></summary>
<br/>

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)

</details>

<details open>
<summary><b>Development Tools</b></summary>
<br/>

![Nodemon](https://img.shields.io/badge/Nodemon-76D04B?style=for-the-badge&logo=nodemon&logoColor=white)
![dotenv](https://img.shields.io/badge/.env-ECD53F?style=for-the-badge&logo=dotenv&logoColor=black)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)

</details>

## 📁 Project Structure

```
chat-app/
│
├── 🔧 backend/
│   ├── src/
│   │   ├── 🎮 controllers/     # Business logic & request handlers
│   │   ├── 📊 models/          # MongoDB schemas & models
│   │   ├── 🛣️  routes/          # API endpoint definitions
│   │   ├── 🔒 middleware/      # Authentication & validation
│   │   ├── 🛠️  lib/             # Database config & utilities
│   │   └── 🚀 index.js         # Server entry point
│   └── 📦 package.json
│
└── 🎨 frontend/
    ├── src/
    │   ├── 🖼️  assets/          # Images, icons & static files
    │   ├── 📱 App.jsx          # Root component
    │   └── ⚡ main.jsx         # React application entry
    ├── 🌐 public/              # Public assets
    └── 📦 package.json
```

## 🚀 Getting Started

### 📋 Prerequisites

![Node.js](https://img.shields.io/badge/Node.js-v16+-339933?style=flat-square&logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/MongoDB-local/Atlas-47A248?style=flat-square&logo=mongodb)
![npm](https://img.shields.io/badge/npm-or_yarn-CB3837?style=flat-square&logo=npm)

### 📥 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ggauravky/chat-app.git
   cd chat-app
   ```

2. **Backend Setup** 🔧

   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup** 🎨
   ```bash
   cd ../frontend
   npm install
   ```

### 🔐 Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

> ⚠️ **Important:** Never commit your `.env` file to version control!

### ▶️ Running the Application

**Development Mode:**

1. **Start the backend server** 🔧

   ```bash
   cd backend
   npm run dev
   ```

   ✅ Server runs on `http://localhost:5001`

2. **Start the frontend** 🎨 _(in a new terminal)_
   ```bash
   cd frontend
   npm run dev
   ```
   ✅ App runs on `http://localhost:5173`

---

## 🔑 API Endpoints

| Method | Endpoint           | Description       | Auth Required |
| ------ | ------------------ | ----------------- | ------------- |
| `POST` | `/api/auth/signup` | Register new user | ❌            |
| `POST` | `/api/auth/login`  | User login        | ❌            |
| `POST` | `/api/auth/logout` | User logout       | ✅            |

---

## 🛡️ Security Features

<table>
<tr>
<td>

🔒 **Password Security**

- Bcrypt hashing (10 rounds)
- Salt generation per user

</td>
<td>

🎫 **Token Management**

- JWT authentication
- HTTP-only cookies

</td>
</tr>
<tr>
<td>

🍪 **Cookie Security**

- SameSite policy
- Secure flag in production

</td>
<td>

⚙️ **Environment Config**

- Environment-based settings
- Secret key management

</td>
</tr>
</table>

---

## 🎯 Roadmap

<table>
<tr><td>

### Phase 1: Core Features

- [x] User authentication
- [x] Real-time messaging
- [ ] Direct messaging
- [ ] Message history

</td><td>

### Phase 2: Enhanced Features

- [ ] Group chat functionality
- [ ] File/image sharing
- [ ] User online status
- [ ] Typing indicators

</td></tr>
<tr><td>

### Phase 3: Advanced Features

- [ ] Message read receipts
- [ ] Push notifications
- [ ] Message reactions
- [ ] Search functionality

</td><td>

### Phase 4: UI/UX

- [ ] Dark mode
- [ ] Custom themes
- [ ] Voice messages
- [ ] Video calls

</td></tr>
</table>

---

## 👨‍💻 Author

<div align="center">

**Gaurav Kumar**

[![GitHub](https://img.shields.io/badge/GitHub-ggauravky-181717?style=for-the-badge&logo=github)](https://github.com/ggauravky)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/ggauravky)

</div>

---

## 📝 License

This project is licensed under the **ISC License**.

---

<div align="center">

### ⭐ Don't forget to star this repo if you found it helpful!

Built with ❤️ using the **MERN Stack**

![Made with Love](https://img.shields.io/badge/Made%20with-Love-red?style=for-the-badge&logo=heart)
![MERN Stack](https://img.shields.io/badge/MERN-Stack-blue?style=for-the-badge)

</div>
