/*
    Gesture bridge client.

    Connects to a bridge server (see /bridge in the repo root) and turns
    incoming text commands into pattern-navigation / UI actions. The bridge
    server is what a Neural Band companion app (or the included test client)
    talks to. See /bridge/README.md for the full setup.
*/

// Point this at your bridge server. wss:// is required because this page is
// served over https (github.io) — plain ws:// is blocked as mixed content
// by the browser, except when everything runs on localhost.
const GESTURE_BRIDGE_URL = 'wss://localhost:7890';

const ws = new WebSocket(GESTURE_BRIDGE_URL);

ws.addEventListener('open', () => console.log('connected to gesture bridge'));
ws.addEventListener('close', () => console.log('disconnected from gesture bridge'));
ws.addEventListener('error', (e) => console.log('gesture bridge error', e));

ws.addEventListener('message', (event) => {
    const cmd = event.data;
    console.log('gesture bridge message:', cmd);

    switch (cmd) {
        case 'next':
            displayNext(true);
            break;
        case 'prev':
            displayNext(false);
            break;
        case 'fullscreen':
            togglePatternFullscreen();
            break;
        default:
            // fall back to original behavior: a digit selects a pattern by index
            handleKeydownEvent(cmd);
    }
});

function handleKeydownEvent(data) {
    const event = new KeyboardEvent('keydown', { key: data });
    document.dispatchEvent(event);
}

document.addEventListener('keydown', (event) => {
    const index = parseInt(event.key, 10) - 1;
    if (!isNaN(index) && patternList.children[index]) {
        patternList.children[index].dispatchEvent(new Event('click', { target: patternList.children[index] }));
        $('#patternDisplay').trigger('change');
    }
});

/*
    Hides the editor panel so the pattern canvas fills the viewport.

    NOTE: this only toggles layout (CSS), not the browser's native Fullscreen
    API. element.requestFullscreen() requires a real user gesture (an actual
    click/tap) — a call triggered from a WebSocket message handler is
    rejected by the browser as not having "user activation." If you also want
    the browser chrome hidden, trigger fullscreen with one manual click first;
    after that, gesture-triggered "fullscreen" commands just hide/show the
    editor panel underneath the already-fullscreened window.
*/
let patternIsFullscreen = false;
function togglePatternFullscreen() {
    const infoPanel = document.querySelector('#info');
    const directions = document.querySelector('#directions');
    patternIsFullscreen = !patternIsFullscreen;
    if (infoPanel) infoPanel.style.display = patternIsFullscreen ? 'none' : '';
    if (directions) directions.style.display = patternIsFullscreen ? 'none' : '';
}
