const WebSocket = require('ws');

var wss = new WebSocket.Server({ port: 23480 });

var chessControl = new Map();

import { chessStepOn, gameRound, chessMove, checkPoliceWin } from "./GameMap.js";


wss.on("connection", function (ws) {
    ws.onmessage(function (msg) {
        processMessgae(ws, msg);
    });
    ws.on("error", function () {
        ws.close();
    });
});

function boardcastStatue() {

}

function processMessgae(ws, msg) {
    var obj = JSON.parse(msg);
    if (obj.type == "hello") {
        msg_hello(obj);
    }
    if (obj.type == "play") {
        msg_play(msg);
    }

    boardcastStatue();
}

function msg_hello(obj) {
    var str = obj.name;
    var ctl = obj.controlChess;
    chessControl.set(str, ctl);

}

function msg_play(msg) {
    var str = obj.name;

    //检查能不能走
    var ctl = chessControl.get(str);
    var suc = false;
    for (var i = 0; i < ctl.length; ++i) {
        if (ctl[i] == chessStepOn) {
            suc = true;
            break;
        }
    }
    if (!suc) {
        return;
    }

    var where = obj.where;
    var type = obj.chess_type;


}