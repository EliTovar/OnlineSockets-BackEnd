const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const PORT = 3000;
let players = {};

io.on('connection', (socket) => {
  console.log('✅ Cliente conectado:', socket.id);

  // Enviar a este cliente todos los jugadores actuales
  socket.emit('current-players', players);

  // Nuevo jugador
  socket.on('new-player', (data) => {
    players[socket.id] = { ...data };
    socket.broadcast.emit('player-joined', { id: socket.id, ...data });
  });

  // Movimiento
  socket.on('update-position', (data) => {
    const payload = {
    id: socket.id, // ✅ MUY IMPORTANTE
    position: data.position,
    rotation: data.rotation
    }
      socket.broadcast.emit('player-moved', payload);
  });

  // Desconexión
  socket.on('disconnect', () => {
    console.log('🚫 Cliente desconectado:', socket.id);
    delete players[socket.id];
    socket.broadcast.emit('player-left', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`✅ Servidor en http://localhost:${PORT}`);
});
