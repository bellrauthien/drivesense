const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*"
  }
});

io.on('connection', (socket) => {
  console.log('Client connected');

  const interval = setInterval(() => {
    const event = {
      timestamp: new Date().toISOString(),
      vehicleId: Math.floor(Math.random() * 100),
      event: 'Hard Braking'
    };
    socket.emit('vehicle_event', event);
  }, 3000);

  socket.on('disconnect', () => {
    clearInterval(interval);
    console.log('Client disconnected');
  });
});

app.get('/', (req, res) => {
  res.send('DriveSense backend is running');
});

server.listen(4000, () => {
  console.log('Backend listening on port 4000');
});