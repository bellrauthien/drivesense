import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

function App() {
  const [events, setEvents] = useState([]);
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    socket.on('vehicle_event', (event) => {
      setEvents((prev) => [event, ...prev]);
    });
  }, []);

  const uniqueVehicles = [...new Set(events.map(e => e.vehicleId))];

  const getAlertColor = (message) => {
    if (!message) return '#f0f0f0';
    if (message.includes('Overspeeding')) return '#ffcccc';
    if (message.includes('Harsh braking')) return '#ffe0b3';
    if (message.includes('Sharp turn')) return '#cce5ff';
    return '#e6ffe6';
  };

  const matchesTypeFilter = (message) => {
    if (typeFilter === 'All') return true;
    return message && message.includes(typeFilter);
  };

  const filteredEvents = events.filter(e =>
    (vehicleFilter === 'All' || e.vehicleId === vehicleFilter) &&
    matchesTypeFilter(e.message)
  );

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>🚗 DriveSense Dashboard</h1>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' }}>
        <div>
          <label htmlFor="vehicleFilter">Filter by vehicle: </label>
          <select
            id="vehicleFilter"
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
          >
            <option value="All">All</option>
            {uniqueVehicles.map((id) => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="typeFilter">Filter by event type: </label>
          <select
            id="typeFilter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Overspeeding">Overspeeding</option>
            <option value="Harsh braking">Harsh braking</option>
            <option value="Sharp turn">Sharp turn</option>
            <option value="Normal speed">Normal</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
        {filteredEvents.map((e, index) => (
          <div
            key={index}
            style={{
              backgroundColor: getAlertColor(e.message),
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '1rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <strong>{e.message || `[${e.timestamp}] Vehicle ${e.vehicleId}`}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
