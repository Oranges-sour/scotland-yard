var ws;

import { updateGameStatue, gameData } from "./idx.js";

var name = "123";

export function webInit() {
    ws = new WebSocket("ws://127.0.0.1:23480");

    ws.onopen = function () {
        {
            var obj = new Object();
            obj.type = "hello";
            obj.name = name;
            obj.controlChess = gameData.selfChessCtl;

            var str = JSON.stringify(obj);
            ws.send(str);
        }
        {
            var obj = new Object();
            obj.type = "reset";
            var str = JSON.stringify(obj);
            ws.send(str);
        }
    };
    ws.onmessage = function (e) {
        var obj = JSON.parse(e.data);
        processMsg(obj);
    };

    ws.onclose = function () {

    }
}

export function playChess(where, card_type) {
    var obj = new Object();
    obj.type = "play";
    obj.name = name;
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