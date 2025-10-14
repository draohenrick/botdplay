const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const usersRouter = require('./routes/users');
const botsRouter = require('./routes/bots');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: 'https://chatbotdplay.netlify.app', credentials: true } });

// MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dplay', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Middleware
app.use(cors({ origin: 'https://chatbotdplay.netlify.app', credentials: true }));
app.use(express.json());

// Rotas
app.use('/users', usersRouter);
app.use('/bots', botsRouter);

// WebSocket
io.on('connection', socket => {
  socket.on('join', userId => socket.join(userId));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
