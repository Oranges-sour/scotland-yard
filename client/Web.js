
import {
    game
} from "./Game.js";

import { resetUI, closeUI, updateMenuStatue, btnCtlSuccess, btnCtlFailed } from "./MenuUI.js";


export class Web {
    constructor() {
        this.userName = randomString(true, 5, 8);
        this.connected = false;
        this.onopen = false;
    }

    init() {
        var that = this;
        setInterval(function () {
            that.webUpdate();
        }, 200);
    }

    isServerConnected() {
        return this.connected;
    }

    webUpdate() {
        if (!this.connected && !this.onopen) {
            this.ws = new WebSocket("ws://192.168.1.109:23480");
            this.onopen = true;

            var that = this;
            this.ws.onopen = function () {
                console.log("Connected");
                that.connected = true;
                that.onopen = false;

                //regist name
                var obj = new Object();
                obj.type = "regist";
                obj.name = this.userName;

                var str = JSON.stringify(obj);
                that.ws.send(str);
            };


            this.ws.onmessage = function (e) {
                var obj = JSON.parse(e.data);
                that.processMsg(obj);
            };

            this.ws.onclose = function () {
                that.onopen = false;
                that.connected = false;
            }
        }

        // if (this.connected) {
        //     var obj = new Object();
        //     obj.type = "heart_beat";
        //     obj.name = this.userName;

        //     var str = JSON.stringify(obj);
        //     this.ws.send(str);
        // }
    }

    joinGame(ctl) {

        var obj = new Object();
        obj.type = "join";
        obj.name = this.userName;
        obj.controlChess = ctl;

        var str = JSON.stringify(obj);
        this.ws.send(str);
    }

    quitGame() {
        var obj = new Object();
        obj.type = "quit";
        obj.name = this.userName;

        var str = JSON.stringify(obj);
        this.ws.send(str);
    }

    startGame() {
        var obj = new Object();
        obj.type = "start";

        var str = JSON.stringify(obj);
        this.ws.send(str);
    }

    playChess(where, card_type) {
        var obj = new Object();
        obj.type = "play";
        obj.name = this.userName;
        obj.where = where;
        obj.card_type = card_type;

        var str = JSON.stringify(obj);
        this.ws.send(str);
    }

    resetGame() {
        var obj = new Object();
        obj.type = "reset";

        var str = JSON.stringify(obj);
        this.ws.send(str);
    }

    changePlayerCnt(cnt) {
        var obj = new Object();
        obj.type = "playercnt";
        obj.cnt = cnt;

        var str = JSON.stringify(obj);
        this.ws.send(str);
    }

    processMsg(obj) {
        if (obj.type == "upd") {
            game.updateGameStatue(obj);
        }
        if (obj.type == "reset") {
            game.resetGame();
            resetUI();
        }
        if (obj.type == "start") {
            game.startGame();
            closeUI();
        }
        if (obj.type == "thief_win") {
            game.gameThiefWin();
        }
        if (obj.type == "police_win") {
            game.gamePoliceWin();
        }
        if (obj.type == "before_start_upd") {
            updateMenuStatue(obj);
        }
        if (obj.type == "ctlbtl_success") {
            btnCtlSuccess(obj);
        }
        if (obj.type == "ctlbtl_failed") {
            btnCtlFailed(obj);
        }
    }
}

function randomString(randomLen, min, max) {
    var str = "",
        range = min,
        arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'A', 'B', 'C', 'D', 'E', 'F',
            'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
            'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    // 随机产生
    if (randomLen) {
        range = Math.round(Math.random() * (max - min)) + min;
    }
    for (var i = 0; i < range; i++) {
        var pos = Math.round(Math.random() * (arr.length - 1));
        str += arr[pos];
    }
    return str;
}


var web = new Web();
export var web;