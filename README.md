# Typing Practice Platform - Backend API

A robust, scalable Node.js and Express.js backend designed for the Typing Practice Platform. This API handles role-based authentication, group management, and real-time synchronized typing sessions.

## 🚀 Technologies

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO for live session synchronization
- **Security**: JWT (JSON Web Tokens) with Cookie-based authentication
- **Hashing**: Bcryptjs for secure password storage

## ✨ Key Features

- **Multi-Role Authentication**: Secure login and profile management for Students, Team Leaders, and Admins.
- **Group Management**: Team Leaders can create groups, manage members, and generate invite links.
- **Real-Time Synchronized Sessions**: 
  - Leaders can start/stop collective typing tests.
  - Students are instantly notified and redirected via WebSockets.
  - Live progress tracking and timer synchronization across all participants.
- **Performance Analytics**: Backend logic to process WPM (Words Per Minute), accuracy, and session history.
- **Scalable Architecture**: Entity-based controller/route structure for easy maintenance and expansion.

## 🛠️ API Structure

```bash
├── controllers/      # Business logic for each entity
├── middlewares/      # Auth, RBAC, and error handling
├── models/           # Mongoose schemas (User, Group, Session, etc.)
├── routes/           # Express route definitions
├── sockets/          # Socket.IO event handlers
└── utils/            # Helper functions and response handlers
```

## 🏁 Getting Started

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Setup Environment**: Create a `.env` file with the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   ```
4. **Seed Admin (Optional)**: `node seedAdmin.js`
5. **Run in development**: `npm run dev`

## 🔒 Security

This API implements best practices for security:
- Role-Based Access Control (RBAC) on all sensitive routes.
- Secure, HTTP-only cookie authentication to prevent XSS.
- CORS protection configured for authorized frontend origins.
- Input validation and centralized error handling.
