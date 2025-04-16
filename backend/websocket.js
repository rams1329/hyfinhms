// backend/websocket.js
const WebSocket = require('ws');

let wss;

const setupWebSocket = (server) => {
  wss = new WebSocket.Server({ server });
  
  wss.on('connection', (ws) => {
    console.log('Client connected');
    
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });
  
  console.log('WebSocket server is running');
};

const notifyAppointmentUpdate = (doctorId, date) => {
  if (!wss) return;
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'APPOINTMENT_UPDATE',
        doctorId: doctorId.toString(),
        date: date
      }));
    }
  });
};

module.exports = { setupWebSocket, notifyAppointmentUpdate };