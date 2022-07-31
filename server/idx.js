const WebSocket = require('ws');

var wss = new WebSocket.Server({ port: 23480 });

var connection = {};

wss.on("connection", function (ws) {
    ws.onmessage(function (msg) {
        processMessgae(ws, msg);

    });
});

function processMessgae(ws, msg) {
    
}