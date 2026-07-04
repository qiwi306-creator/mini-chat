const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Раздаём статические файлы клиента
app.use(express.static('../client'));

// Когда кто-то подключается
io.on('connection', (socket) => {
  console.log('👤 Новый пользователь:', socket.id);

  // Получаем сообщение и рассылаем всем
  socket.on('chat message', (msg) => {
    io.emit('chat message', {
      text: msg.text,
      user: msg.user,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    });
  });

  socket.on('disconnect', () => {
    console.log('👋 Пользователь отключился:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('🚀 Сервер запущен: http://localhost:3000');
});