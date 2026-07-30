/*
    Minimal WebSocket bridge.

    Relays short text commands ("next", "prev", "fullscreen", or a digit)
    between whoever sends them (eventually: a phone app using the Meta
    Wearables Device Access Toolkit to read Neural Band gestures) and the
    WebVR-Patterns browser tab (Custom/keyDownInput.js connects here).

    See README.md in this folder for setup.
*/

const https = require('https');
const fs = require('fs');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 7890;

const server = https.createServer({
    cert: fs.readFileSync('cert.pem'),
    key: fs.readFileSync('key.pem'),
});

const wss = new WebSocketServer({ server });
const clients = new Set();

wss.on('connection', (socket, req) => {
    console.log('client connected:', req.socket.remoteAddress);
    clients.add(socket);

    socket.on('close', () => {
        clients.delete(socket);
        console.log('client disconnected');
    });

    // Relay any incoming command to every other connected client.
    // In practice: the browser tab connects and listens; the phone app
    // (or gesture-test-client.js) connects and sends.
    socket.on('message', (data) => {
        const command = data.toString();
        console.log('relaying command:', command);
        for (const client of clients) {
            if (client !== socket && client.readyState === client.OPEN) {
                client.send(command);
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`gesture bridge listening on wss://localhost:${PORT}`);
});
