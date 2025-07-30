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
app.use(bodyParser.json({ limit: '10mb' }));


// Function to interpret vehicle events
function interpretEvent(event) {
  const vehicleId = event.vehicleId || event.vehicle_id || 'unknown';
  const timestamp = event.timestamp || 'no timestamp';
  const speed = event.speed !== undefined ? event.speed : event.speed_kmh;
  const deceleration = event.deceleration;
  const turnAngle = event.turnAngle;

  let message = `[${timestamp}] Vehicle ${vehicleId}:`;
  const conditions = [];
  let severity = 'low';
  
  const eventType = event.eventType || event.event_type;

  if (eventType === 'harsh_braking') {
    conditions.push('Harsh braking (event type)');
    severity = 'high';
  }
  if (eventType === 'overspeeding') {
    conditions.push('Overspeeding (event type)');
    severity = 'high';
  }
  if (eventType === 'sharp_turn') {
    conditions.push('Sharp turn (event type)');
    severity = 'high';
  }


  if (speed !== undefined) {
    if (speed > 120) {
      conditions.push(`Overspeeding (${speed} km/h)`);
      severity = 'high';
    } else if (speed > 100) {
      conditions.push(`High speed (${speed} km/h)`);
      if (severity !== 'high') severity = 'medium';
    } else {
      conditions.push(`Normal speed (${speed} km/h)`);
    }
  }

  if (deceleration !== undefined && deceleration < -5) {
    conditions.push(`Harsh braking (${deceleration} m/s²)`);
    severity = 'high';
  }

  if (turnAngle !== undefined && Math.abs(turnAngle) > 45) {
    conditions.push(`Sharp turn (${turnAngle}°)`);
    severity = 'high';
  }

  if (conditions.length > 0) {
    message += ' ' + conditions.join('; ');
  } else {
    message += ' Event received';
  }

  return { message, severity };
}



// WebSocket connection handler
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Endpoint for single event
app.post('/api/events', (req, res) => {
  const event = req.body;
  if (!event) {
    return res.status(400).json({ error: 'Invalid event payload' });
  }
  const { message, severity } = interpretEvent(event);
  io.emit('vehicle_event', { ...event, message, severity });

  res.status(200).json({ status: 'Event broadcasted', message });
});

// Endpoint for bulk events
app.post('/api/events/bulk', (req, res) => {
  const events = req.body;
  if (!Array.isArray(events)) {
    return res.status(400).json({ error: 'Payload must be an array of events' });
  }

  const results = events.map(event => {
    const { message, severity } = interpretEvent(event);
    io.emit('vehicle_event', { ...event, message, severity });
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
