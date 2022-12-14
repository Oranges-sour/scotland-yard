import { WebSocketServer } from 'ws';

var wss = new WebSocketServer({ port: 23480 });

var chessControl = new Map();

var heartBeatCnt = new Map();

import {
    chessStepOn, gameRound, chessMove,
    checkPoliceWin, thiefStepList, playerAt,
    cardsLeft, initGame, setChessStepOn, setGameRound,
    setGameStart, gameStart, canMoveCheck
} from "./game.js";

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

function resetGame() {
    chessControl.clear();
    for (var i = 1; i <= 6; ++i) {
        chessChooseStatue[i] = false;
    }

    initGame();

    setGameStart(false);
    boardcastReset();
}


var playerCnt = 2;
var chessChooseStatue = new Array();
for (var i = 1; i <= 6; ++i) {
    chessChooseStatue[i] = false;
}
//广播游戏开始前的玩家选择等状态
function boardcastBeforeStartStatue() {
    var obj = new Object();

    obj.type = "before_start_upd";

    obj.playerChooseStatue = chessChooseStatue;
    obj.playerCnt = playerCnt;

    var j = JSON.stringify(obj);
    wss.clients.forEach(function each(e) {
        e.send(j);
    });
}

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

function boardcastStart() {
    var obj = new Object();
    obj.type = "start";

    var j = JSON.stringify(obj);

    wss.clients.forEach(function each(e) {
        e.send(j);
    });
}

function sendCtlBtnStatue(ws, isSuc, type1, append_msg = "") {
    var obj = new Object();
    var type = "ctlbtl_success";
    if (!isSuc) {
        type = "ctlbtl_failed";
    }
    obj.type = type;
    obj.type1 = type1;
    obj.append = append_msg;

    var j = JSON.stringify(obj);
    ws.send(j);
}

function processMessgae(ws, obj) {


    if (obj.type === undefined) {
        return;
    }

    var type = obj.type;

    var r = false;
    if (type == "regist") {
        r = msg_regist(obj, ws);
    }
    if (type == "join") {
        r = msg_join(obj, ws);
    }
    if (type == "play") {
        r = msg_play(obj);
    }
    if (type == "reset") {
        r = msg_reset(obj, ws);
    }
    if (type == "start") {
        r = msg_start(obj, ws);
    }
    if (type == "quit") {
        r = msg_quit(obj, ws);
    }
    if (type == "heart_beat") {
        r = msg_heardbeat(obj, ws);
    }
    if (type == "playercnt") {
        r = msg_playercnt(obj, ws);
    }
    if (r) {
        if (!gameStart) {
            boardcastBeforeStartStatue();
        } else {
            boardcastStatue();
        }
    }
}

function msg_playercnt(obj) {
    if (obj.cnt === undefined) {
        return true;
    }

    console.log("-ChangePlayerCnt-" + " Cnt:" + obj.cnt);
    playerCnt = obj.cnt;

    resetGame();
    return true;
}

//心跳未完工
function msg_heardbeat(obj, ws) {

}

function msg_regist(obj, ws) {
    if (obj.name === undefined) {
        return true;
    }


    //初始化心跳
    heartBeatCnt.set(obj.name, 1);

    return true;
}

function msg_quit(obj, ws) {
    if (obj.name === undefined) {
        return true;
    }

    console.log("-Quit-" + " Name:" + obj.name);
    var str = obj.name;
    if (!chessControl.has(str)) {
        sendCtlBtnStatue(ws, false, "quit");
        console.log("-Failed- Didn't join before.");
        return true;
    }
    var ctl = chessControl.get(str);
    for (var i = 0; i < ctl.length; ++i) {
        chessChooseStatue[ctl[i]] = false;
    }

    chessControl.delete(str);

    sendCtlBtnStatue(ws, true, "quit");

    console.log("-Success-");
    return true;
}

function msg_join(obj, ws) {
    if (obj.name === undefined || obj.controlChess === undefined) {
        return true;
    }

    console.log("-Join-" + " Name:" + obj.name + " CtlChess:" + obj.controlChess);
    var str = obj.name;
    var ctl = obj.controlChess;

    //看看他是不是加入了其他的
    if (chessControl.has(str)) {
        sendCtlBtnStatue(ws, false, "join");

        console.log("-Failed- Has joined before.");
        return true;
    }

    //看看在他之前是不是有人已经选过相同的了
    var suc = true;
    for (var i = 0; i < ctl.length; ++i) {
        if (chessChooseStatue[ctl[i]]) {
            suc = false;
            break;
        }
    }
    if (!suc) {
        sendCtlBtnStatue(ws, false, "join");

        console.log("-Failed- Somebody has chosen the same chess before.");
        return true;
    }
    ////

    chessControl.set(str, ctl);
    for (var i = 0; i < ctl.length; ++i) {
        chessChooseStatue[ctl[i]] = true;
    }

    sendCtlBtnStatue(ws, true, "join", ctl);

    console.log("-Success-");
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
        return true;
    }
    if (obj.name === undefined || obj.card_type === undefined || obj.where === undefined) {
        return true;
    }

    console.log("-Play- name:" + obj.name + " chessOn:" + chessStepOn + " where:" + obj.where + " cardType:" + obj.card_type);
    var str = obj.name;
    if (!chessControl.has(str)) {
        console.log("-Failed- Player is not in game.");
        return true;
    }
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
        console.log("-Failed- Not this player's turn to go.");
        return true;
    }

    function moveSuccess(type) {
        console.log("-Success- Now player statue: " + playerAt);

        if (chessStepOn == 1) {
            thiefStepList[gameRound] = type;
        }

        while (true) {
            //成功走棋
            setChessStepOn(chessStepOn + 1);

            if (chessStepOn > 6) {
                setChessStepOn(1);
                setGameRound(gameRound + 1);
            }

            //这个人有方式可以移动
            if (canMoveCheck()) {
                break;
            }
            //不然直接跳过这个人
            console.log("-Jump- " + chessStepOn);
        }


        if (checkPoliceWin()) {
            boardcastPoliceWin();
            console.log("-GameWin- Police.");
            //不需要在广播游戏状态
            return false;
        } else if (gameRound > 24) {
            boardcastThiefWin();
            console.log("-GameWin- Thief.");
            return false;
        }
    }

    var where = obj.where;
    var type = obj.card_type;
    if (type != 4) {
        //使用x2卡走了一步，但是现在突然换卡了，要重置玩家的位置
        if (card4_step != 1) {
            playerAt[chessStepOn] = card4_orgOn;
            card4_step = 1;
        }

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
                console.log("-Failed- Can't go to this anchor.");
                return true;
            }
            card4_goo = r;
            card4_step += 1;
        }
        //第二次使用4号卡
        else if (card4_step == 2) {
            var r = chessMove(chessStepOn, type, where);

            //任何道路都无法过去
            if (r[0] == false) {
                //不成功，要从头走棋
                playerAt[chessStepOn] = card4_orgOn;
                card4_step = 1;

                console.log("-Failed- Can't go to this anchor.");
                return true;
            }

            var suc = false;
            for (var i = 1; i <= 4; ++i) {
                //保证两次走棋是使用的一样的交通
                if (r[i] == card4_goo[i] && r[i] == true) {
                    suc = true;
                }
            }
            //可以走，减少一张卡
            if (suc) {
                card4_step = 1;
                cardsLeft[chessStepOn][type] -= 1;
                moveSuccess(type);
            }
            //两步不一样，要从头走棋
            if (!suc) {
                console.log("-Failed- Two steps cannot use the same card.");
                playerAt[chessStepOn] = card4_orgOn;
                card4_step = 1;
            }
        }
    }

    return true;
}

function msg_reset(msg, ws) {
    console.log("-Reset-");

    resetGame();

    sendCtlBtnStatue(ws, true, "reset");

    console.log("-Success-");
    return true;
}

function msg_start(obj, ws) {

    console.log("-Start-");
    if (gameStart) {
        console.log("-Failed- Game has already started. This player is set as observer.");

        var obj = new Object();
        obj.type = "start";

        var j = JSON.stringify(obj);

        ws.send(j);

        return true;
    }
    //检查是不是每个棋子都有人操控
    var suc = true;
    for (var i = 1; i <= 6; ++i) {
        if (!chessChooseStatue[i]) {
            suc = false;
        }
    }

    if (!suc) {
        console.log("-Failed- Some chesses have nobody control.");

        sendCtlBtnStatue(ws, false, "start");

        return true;
    }

    boardcastStart();
    setGameStart(true);

    console.log("-Success-");
    return true;
}