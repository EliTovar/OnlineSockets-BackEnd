const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { text } = require('stream/consumers');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const PORT = process.env.PORT || 3000;
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
    id: socket.id,
    position: data.position,
    rotation: data.rotation,
    animation: data.animation
  };
  socket.broadcast.emit('player-moved', payload);
});

socket.on('move', (data) => {
  socket.broadcast.emit('remoteMove', {
    id: socket.id,
    position: data.position,
    rotation: data.rotation
  });
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
