/*
    Manual test harness — simulates a gesture command so you can verify the
    browser <-> bridge-server <-> "gesture source" pipeline works BEFORE the
    Neural Band companion app exists.

    Usage (with bridge-server.js already running):
        node gesture-test-client.js next
        node gesture-test-client.js prev
        node gesture-test-client.js fullscreen
        node gesture-test-client.js 3
*/

const WebSocket = require('ws');
const command = process.argv[2] || 'next';

const socket = new WebSocket('wss://localhost:7890', { rejectUnauthorized: false });

socket.on('open', () => {
    console.log('sending:', command);
    socket.send(command);
    socket.close();
});

socket.on('error', (err) => console.error('error:', err.message));
