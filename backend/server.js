const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io configuration with CORS support
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow all origins for dev/testing. Adjust for production.
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Basic API Check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'SkillSwap API is running successfully.' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Socket.io Connections
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);

  // User joins a personal room named after their userId
  socket.on('join_room', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined room ${userId}`);
    }
  });

  // Client sends a real-time message
  socket.on('send_message', async (data) => {
    const { sender, receiver, content } = data;
    if (!sender || !receiver || !content) return;

    try {
      const Message = require('./models/Message');
      // Create message in database
      const newMessage = await Message.create({
        sender,
        receiver,
        content
      });

      // Broadcast message to receiver and sender rooms
      io.to(receiver).emit('receive_message', newMessage);
      io.to(sender).emit('receive_message', newMessage);
    } catch (error) {
      console.error('Error saving socket message:', error.message);
    }
  });

  // Client sends typing notification
  socket.on('typing', (data) => {
    // Expect data to have: senderId, receiverId, isTyping (boolean)
    const { senderId, receiverId, isTyping } = data;
    if (receiverId) {
      io.to(receiverId).emit('typing', { senderId, isTyping });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
