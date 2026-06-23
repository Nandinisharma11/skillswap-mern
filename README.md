# 🎓 SkillSwap: Peer-to-Peer Learning Platform

SkillSwap is a full-stack, production-ready MERN application designed to democratize education on college campuses. It allows students to teach what they excel at and learn what they want to master through a knowledge-barter model. The platform features role-based access control, session requests management, an interactive rating system, and real-time chat powered by WebSockets.

---

## 🚀 Key Features

* **JWT Authentication & Security**: Register, login, and forgot password. Password encryption using Bcrypt. Custom authorization middleware for roles-based protection.
* **Role-Based Dashboards**:
  * **Student**: Manage learning profile, search peer mentors by skill tags, request sessions (specify date, duration, description), rate completed classes.
  * **Mentor**: Manage tutoring offers, accept/reject booking requests, track reviews, and view average ratings.
  * **Admin**: View analytics counters (roles, sessions status, skill trends) and manage/moderate users (ban/unban violators).
* **Real-time Communication**: Instant chat with online peer mentors/students and live typing notifications.
* **Modern Premium UI**: Sleek, glassmorphic dark-mode interface built with modern typography, smooth animations, and custom CSS variables.
* **Responsive Layouts**: Designed to run cleanly on desktop and mobile screens.

---

## 🛠️ Tech Stack

* **Frontend**: React (Vite), React Router, Context API, Vanilla CSS, Axios, Lucide React (Icons), Socket.io-client.
* **Backend**: Node.js, Express.js, HTTP Server, Socket.io.
* **Database**: MongoDB & Mongoose.
* **Auth**: JSON Web Tokens (JWT) & BcryptJS.

---

## 📁 Repository Structure

```
skillswap/
├── backend/
│   ├── config/             # MongoDB configurations
│   ├── controllers/        # Express request handling logic
│   ├── middleware/         # JWT verification & role authorization checks
│   ├── models/             # Mongoose schemas (User, Session, Message)
│   ├── routes/             # API routes routing mapping
│   ├── server.js           # Server startup (HTTP + WebSockets)
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components (Navbar, Toast, protected routes)
│   │   ├── context/        # Auth and WebSockets contexts
│   │   ├── pages/          # Dashboards, login/register, chats, landing page
│   │   ├── App.css         # Dashboards and component styles
│   │   ├── index.css       # Core variables and global styles
│   │   └── App.jsx         # Routes declarations
│   └── vite.config.js
└── README.md
```

---

## 💻 Local Installation & Setup

### Prerequisites
* [Node.js](https://nodejs.org/en/) (LTS recommended)
* [MongoDB](https://www.mongodb.com/try/download/community) running locally on port `27017` **OR** a MongoDB Atlas connection string.

### 1. Clone & Configure Backend
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create your environment variables configuration:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` with your variables (e.g. database string and a secret JWT key):
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/skillswap
   JWT_SECRET=your_jwt_signing_key_here
   ```
4. Start the backend developer environment:
   ```bash
   npm run dev
   ```

### 2. Configure & Start Frontend
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Launch the frontend developer server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔌 API Route Map

### Authentication (`/api/auth`)
* `POST /register` - Register a new account.
* `POST /login` - Log in and retrieve a JWT token.
* `POST /forgot-password` - Generate reset token (logs to backend console).
* `POST /reset-password/:token` - Update password using token.

### User Profiles (`/api/users`)
* `GET /profile` - Retrieve current user profile (JWT protected).
* `PUT /profile` - Update academic title, bio, and skills list (JWT protected).
* `GET /mentors` - Query peer mentors list with search filter matching skills (JWT protected).

### Sessions & Booking (`/api/sessions`)
* `POST /request` - Send booking requests to mentors (JWT protected).
* `GET /my-sessions` - Retrieve sessions history matching user's active role (JWT protected).
* `PUT /:id/status` - Mentors accept, reject, or complete session (JWT protected).
* `PUT /:id/rate` - Students rate and review completed session (JWT protected).

### Live Chat Logs (`/api/chat`)
* `GET /messages/:userId` - Retrieve messages log between current user and peer (JWT protected).
* `GET /conversations` - List active chat partner profiles with unread counters (JWT protected).

### Admin Tools (`/api/admin`)
* `GET /analytics` - Aggregate user and class booking counters (Admin protected).
* `GET /users` - Retrieve and search user accounts (Admin protected).
* `PUT /users/:id/ban` - Toggle active/banned status for accounts (Admin protected).

---

## ☁️ Production Deployment

* **Database**: MongoDB Atlas.
* **Backend API**: Render (enables WebSockets support out of the box).
* **Frontend Static Build**: Vercel.
* For step-by-step instructions, see our detailed **[Deployment Guide](DEPLOYMENT.md)**.
