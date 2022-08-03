
import {
    game
} from "./Game.js";
import { touchStartPos } from "./idx.js";

import { resetUI } from "./menuui.js";


class Web {
    constructor() {
        this.userName = "123";
        this.connected = false;
        this.onopen = false;
    }

    init() {
        var that = this;
        setInterval(function () {
            that.webUpdate();
        }, 200);
    }

    webUpdate() {
        if (!this.connected && !this.onopen) {
            this.ws = new WebSocket("ws://101.43.196.171:23480");
            this.onopen = true;

            var that = this;
            this.ws.onopen = function () {
                console.log("Connected");
                that.connected = true;
                that.onopen = false;
            };


            this.ws.onmessage = function (e) {
                var obj = JSON.parse(e.data);
                //console.log(that);
                that.processMsg(obj);
            };


            this.ws.onclose = function () {
                that.onopen = false;
                that.connected = false;
            }
        }
    }

    helloGame(name, ctl) {
        this.userName = name;
        game.setSelfChessCtl(ctl);

        var obj = new Object();
        obj.type = "hello";
        obj.name = name;
        obj.controlChess = game.gameData.selfChessCtl;

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
        }
        if (obj.type == "thief_win") {
            game.gameThiefWin();
        }
        if (obj.type == "police_win") {
            game.gamePoliceWin();
        }
    }
}


var web = new Web();
export var web;