# Gesture bridge

Relays commands from a gesture source (eventually: a phone app reading Meta
Neural Band gestures via the Wearables Device Access Toolkit) to the
`Custom/` pattern viewer page, over a WebSocket.

```
gesture source (phone app / test client)
        │  wss://
        ▼
  bridge-server.js  ──relays──▶  Custom/keyDownInput.js (browser tab)
```

## Setup

```bash
cd bridge
npm install
```

`wss://` requires TLS, since the pattern viewer page is served over HTTPS
and browsers block plain `ws://` as mixed content (except on localhost).
Generate a self-signed cert for local development:

```bash
openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 365 -subj "/CN=localhost"
```

## Run

```bash
npm start
```

Then, in `Custom/keyDownInput.js`, point `GESTURE_BRIDGE_URL` at this
server's address (defaults to `wss://localhost:7890`).

## Test without hardware

With the server running:

```bash
node gesture-test-client.js next
node gesture-test-client.js prev
node gesture-test-client.js fullscreen
```

Each should immediately affect the pattern viewer tab. Confirming this
works is a prerequisite before wiring up real Neural Band gesture input —
it isolates bridge/page bugs from SDK/hardware bugs.

## Supported commands

| Command      | Effect                                            |
|--------------|----------------------------------------------------|
| `next`       | advance to the next pattern (`displayNext(true)`)  |
| `prev`       | go to the previous pattern (`displayNext(false)`)  |
| `fullscreen` | toggle hiding the editor panel                     |
| `"1"`–`"N"`  | jump directly to pattern N in the list             |

## Next step: real gesture input

This bridge is transport-only — it doesn't know anything about the Neural
Band. Once you have access to Meta's Wearables Device Access Toolkit
developer preview, the remaining piece is a small iOS/Android app that
registers a gesture callback and calls `socket.send("next")` /
`socket.send("prev")` on each recognized gesture, using the same message
format `gesture-test-client.js` uses here.
