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

// Function to interpret vehicle events
function interpretEvent(event) {
  let message = `[${event.timestamp || 'no timestamp'}] Vehicle ${event.vehicleId || 'unknown'}:`;
  const conditions = [];

  if (event.speed !== undefined) {
    if (event.speed > 120) {
      conditions.push(`Overspeeding (${event.speed} km/h)`);
    } else if (event.speed > 100) {
      conditions.push(`High speed (${event.speed} km/h)`);
    } else {
      conditions.push(`Normal speed (${event.speed} km/h)`);
    }
  }

  if (event.deceleration !== undefined && event.deceleration < -5) {
    conditions.push(`Harsh braking (${event.deceleration} m/s²)`);
  }

  if (event.turnAngle !== undefined && Math.abs(event.turnAngle) > 45) {
    conditions.push(`Sharp turn (${event.turnAngle}°)`);
  }

  if (conditions.length > 0) {
    message += ' ' + conditions.join('; ');
  } else {
    message += ' Event received';
  }

  return message;
}

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Endpoint for single event
app.post('/event', (req, res) => {
  const event = req.body;
  if (!event) {
    return res.status(400).json({ error: 'Invalid event payload' });
  }

  const message = interpretEvent(event);
  io.emit('vehicle_event', { ...event, message });

  res.status(200).json({ status: 'Event broadcasted', message });
});

// Endpoint for bulk events
app.post('/events/bulk', (req, res) => {
  const events = req.body;
  if (!Array.isArray(events)) {
    return res.status(400).json({ error: 'Payload must be an array of events' });
  }

  const results = events.map(event => {
    const message = interpretEvent(event);
    io.emit('vehicle_event', { ...event, message });
    return { ...event, message };
  });

  res.status(200).json({ status: 'Bulk events broadcasted', count: results.length });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Backend running');
});

// Start the server
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
