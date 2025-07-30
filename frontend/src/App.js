import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const socket = io('http://localhost:4000'); // Ajusta si usas otro puerto o dominio

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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return '#ffcccc'; // rojo
      case 'medium':
        return '#fff3cd'; // amarillo
      case 'low':
      default:
        return '#d4edda'; // verde
    }
  };

  const matchesTypeFilter = (message) => {
    if (typeFilter === 'All') return true;
    return message && message.includes(typeFilter);
  };

  const filteredEvents = events.filter(e =>
    (vehicleFilter === 'All' || e.vehicleId === vehicleFilter) &&
    matchesTypeFilter(e.message)
  );

  const severityData = ['low', 'medium', 'high'].map(sev => ({
    severity: sev,
    count: filteredEvents.filter(e => e.severity === sev).length
  }));

  const vehicleData = uniqueVehicles.map(vehicleId => ({
    vehicleId,
    count: filteredEvents.filter(e => e.vehicleId === vehicleId).length
  }));

  const eventTypes = ['Overspeeding', 'Harsh braking', 'Sharp turn', 'Normal speed'];
  const eventTypeData = eventTypes.map(type => ({
    type,
    count: filteredEvents.filter(e => e.message && e.message.includes(type)).length
  }));

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

      <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>📊 Eventos por Severidad</h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={severityData}>
            <XAxis dataKey="severity" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>🚘 Eventos por Vehículo</h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={vehicleData}>
            <XAxis dataKey="vehicleId" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>📍 Eventos por Tipo</h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={eventTypeData}>
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
        {filteredEvents.map((e, index) => (
          <div
            key={index}
            style={{
              backgroundColor: getSeverityColor(e.severity),
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
