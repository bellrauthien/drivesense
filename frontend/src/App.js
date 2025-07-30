
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    socket.on('vehicle_event', (event) => {
      setEvents((prev) => [event, ...prev]);
    });
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h1>DriveSense Dashboard</h1>
      <ul>
        {events.map((e, index) => (
          <li key={index}>
            {e.message || `[${e.timestamp}] Vehicle ${e.vehicleId}: (no message)`}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
