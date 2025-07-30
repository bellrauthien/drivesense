
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  }
});

app.use(cors());
app.use(bodyParser.json());

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// REST endpoint to receive events and broadcast them
app.post('/event', (req, res) => {
  const event = req.body;
  if (!event) {
    return res.status(400).json({ error: 'Invalid event payload' });
  }

  io.emit('vehicle_event', event);
  res.status(200).json({ status: 'Event broadcasted' });
});

// Start the server
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});


app.get('/', (req, res) => {
  res.send('Backend funcionando');
});
