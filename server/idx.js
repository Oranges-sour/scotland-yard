import { WebSocketServer } from 'ws';

var wss = new WebSocketServer({ port: 23480 });

var chessControl = new Map();

import { chessStepOn, gameRound, chessMove, checkPoliceWin, thiefStepList, playerAt, cardsLeft, initGame, setChessStepOn, setGameRound, setGameStart, gameStart } from "./game.js";

initGame();

wss.on("connection", function (ws) {
    ws.on("message", function (e) {
        var obj = JSON.parse(e);
        processMessgae(ws, obj);
    });
    ws.on("error", function () {
        ws.close();
    });
});

function boardcastStatue() {
    if (!gameStart) {
        return;
    }

    var obj = new Object();

    obj.type = "upd";
    obj.chessStepOn = chessStepOn;
    obj.gameRound = gameRound;
    obj.playerAt = playerAt;
    obj.thiefStepList = thiefStepList;
    obj.cardsLeft = cardsLeft;


    var j = JSON.stringify(obj);

    wss.clients.forEach(function each(e) {
        e.send(j);
    });
}

function boardcastPoliceWin() {
    var obj = new Object();
    obj.type = "police_win";

    var j = JSON.stringify(obj);

    wss.clients.forEach(function each(e) {
        e.send(j);
    });
}

function boardcastThiefWin() {
    var obj = new Object();
    obj.type = "thief_win";

    var j = JSON.stringify(obj);

    wss.clients.forEach(function each(e) {
        e.send(j);
    });
}

function boardcastReset() {
    var obj = new Object();
    obj.type = "reset";

    var j = JSON.stringify(obj);

    wss.clients.forEach(function each(e) {
        e.send(j);
    });
}

function boardcastStart(){
    var obj = new Object();
    obj.type = "start";

    var j = JSON.stringify(obj);

    wss.clients.forEach(function each(e) {
        e.send(j);
    });
}

function processMessgae(ws, obj) {
    var r = false;
    if (obj.type == "hello") {
        r = msg_hello(obj, ws);
    }
    if (obj.type == "play") {
        r = msg_play(obj);
    }
    if (obj.type == "reset") {
        r = msg_reset(obj);
    }
    if (obj.type == "start") {
        r = msg_start(obj);
    }
    if (r) {
        boardcastStatue();
    }

}

function msg_hello(obj) {
    console.log("-Hello-" + " Name:" + obj.name + " CtlChess:" + obj.controlChess);
    var str = obj.name;
    var ctl = obj.controlChess;
    chessControl.set(str, ctl);

    return true;
}

//供4号卡判断使用
//当前是4号卡的第一步还是第二步
var card4_step = 1;
//使用4号卡之前在哪里
var card4_orgOn = 0;
//第一步哪些可以走
var card4_goo = new Array();

function msg_play(obj) {
    if (!gameStart) {
        return;
    }

    console.log("-Play- name:" + obj.name + " chessOn:" + chessStepOn + " where:" + obj.where + " cardType:" + obj.card_type);

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

    function moveSuccess(type) {

        if (chessStepOn == 1) {

            thiefStepList[gameRound] = type;
        }

        //成功走棋
        setChessStepOn(chessStepOn + 1);

        if (chessStepOn > 6) {
            setChessStepOn(1);
            setGameRound(gameRound + 1);
        }

        if (checkPoliceWin()) {
            boardcastPoliceWin();
            //不需要在广播游戏状态
            return false;
        } else if (gameRound > 24) {
            boardcastThiefWin();
            return false;
        }
    }

    var where = obj.where;
    var type = obj.card_type;
    if (type != 4) {
        var r = chessMove(chessStepOn, type, where);
        if (r == 4) {
            moveSuccess(type);
        }
    }
    //小偷使用4号卡(x2)走棋
    if (type == 4) {
        //第一次用4号卡
        if (card4_step == 1) {
            card4_orgOn = playerAt[chessStepOn];
            var r = chessMove(chessStepOn, type, where);
            if (r[0] == false) {
                return true;
            }
            card4_goo = r;

            card4_step += 1;
        }
        //第二次使用4号卡
        else if (card4_step == 2) {
            var r = chessMove(chessStepOn, type, where);

            if (r[0] == false) {
                //不成功，要从头走棋
                playerAt[chessStepOn] = card4_orgOn;
                card4_step = 1;
                return true;
            }
            var suc = false;
            for (var i = 1; i <= 4; ++i) {
                //保证两次走棋是使用的一样的交通
                if (r[i] == card4_goo[i] && r[i] == true) {
                    suc = true;
                }
            }
            if (suc) {
                card4_step = 1;
                moveSuccess(type);
            }

            if (!suc) {
                //不成功，要从头走棋
                playerAt[chessStepOn] = card4_orgOn;
                card4_step = 1;
            }
        }
    }

    return true;
}

function msg_reset(msg) {
    console.log("-Reset-");

    chessControl.clear();
    initGame();

    setGameStart(false);
    boardcastReset();
    return true;
}

function msg_start() {
    console.log("-Start-");
    boardcastStart();
    setGameStart(true);
    return true;
}