var ws;

import { updateGameStatue, gameData, setSelfChessCtl } from "./idx.js";

var userName = "123";

var connected = false;

export function webInit() {
    setInterval(webUpdate, 200);
}

function webUpdate() {
    if (!connected) {
        ws = new WebSocket("ws://127.0.0.1:23480");

        ws.onopen = function () {
            connected = true;
        };
        ws.onmessage = function (e) {
            var obj = JSON.parse(e.data);
            processMsg(obj);
        };

        ws.onclose = function () {
            connected = false;
        }
    }
}

export function helloGame(name, ctl) {
    userName = name;
    setSelfChessCtl(ctl);

    var obj = new Object();
    obj.type = "hello";
    obj.name = name;
    obj.controlChess = gameData.selfChessCtl;

    var str = JSON.stringify(obj);
    ws.send(str);
}

export function playChess(where, card_type) {
    var obj = new Object();
    obj.type = "play";
    obj.name = userName;
    obj.where = where;
    obj.card_type = card_type;

    var str = JSON.stringify(obj);
    ws.send(str);
}

export function resetGame() {
    var obj = new Object();
    obj.type = "reset";

    var str = JSON.stringify(obj);
    ws.send(str);
}

function processMsg(obj) {
    if (obj.type == "upd") {
        updateGameStatue(obj);
    }
}