import exp from "constants";
import { addAbortSignal } from "stream";
import { GameMap } from "./GameMap.js";

//玩家的可能开始点
const playerStart = [141, 197, 174, 155, 198, 138, 132, 103, 117, 112, 94, 29, 34, 26, 13, 50, 53, 91];
//开始点是否被使用
var playerStartUsed = new Array();


var playerAt = new Array();
for (var i = 1; i <= 6; ++i) {
    playerAt[i] = i;
}

//到谁下棋
var chessStepOn = 1;

//整个游戏的轮数
var gameRound = 1;

//游戏未开始
var gameStart = false;

var gameMap = new GameMap();

var thiefStepList = new Array();
for (var i = 1; i <= 24; ++i) {
    thiefStepList[i] = 0;
}

var cardsLeft = new Array();
for (var i = 1; i <= 6; ++i) {
    cardsLeft[i] = new Array();
    for (var j = 1; j <= 5; ++j) {
        cardsLeft[i][j] = 0;
    }
}

export function setChessStepOn(x) {
    chessStepOn = x;
}

export function setGameRound(x) {
    gameRound = x;
}

export function setGameStart(x) {
    gameStart = x;
}

export function initGame() {
    for (var i = 0; i < playerStart.length; ++i) {
        playerStartUsed[i] = false;
    }

    //初始化棋子坐标
    for (var i = 1; i <= 6; ++i) {
        var p = -1;
        while (true) {
            var k = getRandomNum(0, playerStart.length - 1);
            if (!playerStartUsed[k]) {
                playerStartUsed[k] = true;
                p = k;
                break;
            }
        }
        playerAt[i] = playerStart[p];
    }

    chessStepOn = 1;
    gameRound = 1;

    for (var i = 1; i <= 24; ++i) {
        thiefStepList[i] = 0;
    }

    cardsLeft[1][1] = 4;
    cardsLeft[1][2] = 4;
    cardsLeft[1][3] = 3;
    cardsLeft[1][4] = 2;
    cardsLeft[1][5] = 5;

    for (var i = 2; i <= 6; ++i) {
        cardsLeft[i][1] = 12;
        cardsLeft[i][2] = 8;
        cardsLeft[i][3] = 4;
        cardsLeft[i][4] = 0;
        cardsLeft[i][5] = 0;
    }
}

export function checkPoliceWin() {
    for (var i = 2; i <= 6; ++i) {
        if (playerAt[1] == playerAt[i]) {
            return true;
        }
    }
    return false;
}

//走棋
export function chessMove(id, type, where) {
    if (typeof (id) != "number" || typeof (type) != "number" || typeof (where) != "number") {
        return 0;
    }

    if (id < 1 || id > 6) {
        console.log("-Failed- Id out of the game.");
        return 0;
    }
    if (type < 1 || type > 5) {
        console.log("-Failed- Type out of the game.");
        return 0;
    }
    if (where < 1 || where > 199) {
        console.log("-Failed- Where out of the game.");
        return 0;
    }


    //卡太少，走不了
    if (cardsLeft[id][type] <= 0) {
        console.log("-Failed- Doesn't have enough card to go.");
        return 0;
    }

    //不是小偷
    if (id != 1) {
        //踩在其他棋子上了,不包括小偷
        for (var i = 2; i <= 6; ++i) {
            if (playerAt[i] == where) {
                console.log("-Failed- This anchor has been occupied.");
                return 0;
            }
        }
        if (gameMap.cango(type, playerAt[id], where)) {
            cardsLeft[id][type] -= 1;
            cardsLeft[1][type] += 1;
            playerAt[id] = where;
        } else {
            console.log("-Failed- Can't go to this anchor.");
            return 0;
        }
    }
    if (id == 1) {
        //不能呆在原地
        if (playerAt[id] == where) {
            console.log("-Failed- Can't stay where you are.");
            return 0;
        }

        //不是特殊卡
        if (type <= 3) {
            if (gameMap.cango(type, playerAt[id], where)) {
                cardsLeft[id][type] -= 1;
                playerAt[id] = where;
            } else {
                console.log("-Failed- Can't go to this anchor.");
                return 0;
            }
        }
        //特殊卡
        if (type == 5) {
            var suc = false;
            for (var i = 1; i <= 4; ++i) {
                if (gameMap.cango(i, playerAt[id], where)) {
                    cardsLeft[id][type] -= 1;
                    playerAt[id] = where;
                    suc = true;
                    break;
                }
            }
            if (!suc) {
                console.log("-Failed- Can't go to this anchor.");
                return 0;
            }
        }
        /*
            如果是4号特殊卡，走两次
            第一步可以任意走，到第二步时特判一下，如果种类过不来，那就走不了
            然后把步数退回重新走
        */
        if (type == 4) {
            var goo = new Array();

            var suc = false;
            for (var i = 1; i <= 4; ++i) {
                if (gameMap.cango(i, playerAt[id], where)) {
                    suc = true;
                    goo[i] = true;
                } else {
                    goo[i] = false;
                }
            }
            if (suc) {
                playerAt[id] = where;
            }

            //第0个代表是否有任何方法能走过去
            goo[0] = suc;
            return goo;
        }
    }
    //4代表正常移动(1~3留给了4号卡特判用)
    return 4;
}

//能使用任何方式进行走棋(有卡是前提)
//在检查轮空时使用
export function canMoveCheck() {
    //小偷肯定能直接走，不用管
    if (chessStepOn >= 2) {
        //初始化'桶'
        var goo = new Array();
        for (var i = 1; i <= 3; ++i) {
            goo[i] = false;
        }
        ///////////////////////////////////////

        for (var i = 1; i <= 3; ++i) {
            var aa = new Set();
            aa = gameMap.allcango(i, playerAt[chessStepOn]);

            if (Array.from(aa).length > 0) {
                goo[i] = true;
            }
        }


        var suc = false;
        for (var i = 1; i <= 3; ++i) {
            if (goo[i] == true && cardsLeft[chessStepOn][i] > 0) {
                suc = true;
            }
        }

        if (suc == false) {
            return false;
        }
    }

    return true;
}

function getRandomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export var chessStepOn;
export var gameRound;
export var playerAt;
export var thiefStepList;
export var cardsLeft;
export var gameStart;