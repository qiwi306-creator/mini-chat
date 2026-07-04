require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const auth = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB подключена'))
  .catch(err => {
    console.error('❌ Ошибка MongoDB:', err.message);
    console.error('Полная ошибка:', err);
  });

// Middleware
app.use(cors());
app.use(express.json());

// Роуты
app.use('/api/auth', authRoutes);

// Защищённый роут (пример)
app.get('/api/me', auth, async (req, res) => {
  const User = require('./models/User');
  const user = await User.findById(req.userId).select('-password');
  res.json(user);
});

// Раздаём статику клиента
app.use(express.static(path.join(__dirname, '../client')));

// Socket.IO
io.on('connection', (socket) => {
  console.log('👤 Подключился:', socket.id);
  
  socket.on('chat message', (msg) => {
    io.emit('chat message', {
      text: msg.text,
      user: msg.user,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    });
  });
  
  socket.on('disconnect', () => {
    console.log('👋 Отключился:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Сервер на порту ${PORT}`);
});