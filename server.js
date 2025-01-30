const express = require('express');
const cors = require('cors');
const http = require('http'); // For creating the server
const { Server } = require('socket.io'); // For Socket.IO

const userRoutes = require('./Routes/UserRoutes');
const programRoutes = require('./Routes/programRoutes');
const chapterRoutes = require('./Routes/chRoutes');
const chatRoutes = require('./Routes/ChatRoutes');
const  RehabRoutes = require ('./Routes/rehabroutes');

const app = express();
const server = http.createServer(app); // Create an HTTP server
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'], // Add all allowed frontend origins here
    methods: ['GET', 'POST'],
  },
});


app.use(express.json());
app.use(cors());

app.use('/api/programs', programRoutes);
app.use('/api/users', userRoutes);
app.use('/api', chapterRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/rehab', RehabRoutes);

// Socket.IO setup
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen for new messages
  socket.on('send_message', (data) => {
    console.log('Message received:', data);
    // Broadcast the message to all connected clients
    io.emit('receive_message', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
