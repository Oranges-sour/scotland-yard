'use strict'
import Sprite from "./Sprite.js"
import Vec2 from "./Vec2.js";


import { mapDataUpdate, dragMoveMapOnMove, mapInit, mapUpdateOnWheel, mapUpdateOnMouseDown } from "./GameMap.js"
import { Anchor, anchorInit, anchorUpdate } from "./Anchor.js";

import { initUI, uiUpdate, updateUIOnMouseUp } from "./UICtl.js";

import { webInit, playChess, resetGame as webResetGame } from "./web.js";

var sprites_main = new Map();
var sprites_ui = new Map();


var anchors = new Array();
var players = new Array();


var touchStartPos = new Vec2();
var touchEndPos = new Vec2();
var mouseDown = false;

var gameData = new Object();
//游戏局
gameData.gameRound = 1;
//当前选择了哪个卡
gameData.cardSelect = 1;
//到谁下棋
gameData.chessStepOn = 1;
//小偷行动的步骤
gameData.thiefStepList = new Array();
for (var i = 1; i <= 24; ++i) {
    gameData.thiefStepList[i] = 1;
}
//玩家能控制的棋
gameData.selfChessCtl = [1, 2, 3, 4, 5, 6];
//剩余的卡牌
gameData.cardsLeft = new Array();
for (var i = 1; i <= 6; ++i) {
    gameData.cardsLeft[i] = new Array();
    for (var j = 1; j <= 5; ++j) {
        gameData.cardsLeft[i][j] = 0;
    }
}
gameData.playerAt = new Array();
for (var i = 1; i <= 6; ++i) {
    gameData.playerAt[i] = i;
}
gameData.gameStart = false;

//游戏胜利，0:还在继续，1：警察赢，2：小偷赢
gameData.gameWin = 0;

export function updateGameStatue(obj) {
    gameData.cardsLeft = obj.cardsLeft;
    gameData.thiefStepList = obj.thiefStepList;
    gameData.chessStepOn = obj.chessStepOn;
    gameData.playerAt = obj.playerAt;
    gameData.gameRound = obj.gameRound;
}

export function setCardSelect(x) {
    gameData.cardSelect = x;
}

export function setSelfChessCtl(ctl) {
    gameData.selfChessCtl = ctl;
}

export function resetGame() {
    gameData.gameStart = false;
    gameData.gameWin = 0;
}

export function startGame() {
    gameData.gameStart = true;
    gameData.gameWin = 0;
}

export function setGameStart(x) {
    gameData.gameStart = x;
}

export function gamePoliceWin() {
    gameData.gameStart = false;
    gameData.gameWin = 1;
}

export function gameThiefWin() {
    gameData.gameStart = false;
    gameData.gameWin = 2;
}


window.onload = function () {
    init();
}

var touchData = new Object();
touchData.sUserAgent = navigator.userAgent.toLowerCase();
touchData.time0 = 0, touchData.time1 = 0, touchData.cnt = 1;
touchData.startTowSpot = true;
touchData.dist = 0;

if (/ipad|iphone|midp|rv:1.2.3.4|ucweb|android|windows ce|windows mobile/.test(touchData.sUserAgent)) {
    console.log("phone");
    window.ontouchstart = function (e) {
        var e = e.touches[0];
        touchdown(e.pageX, e.pageY);
    }
    window.addEventListener("touchmove", function (e) {
        if (gameData.gameStart) {
            e.preventDefault();
        }

        if (e.touches.length == 1) {
            var ee = e.touches[0];
            touchmoveOneSpot(ee.pageX, ee.pageY);
        }
        if (e.touches.length >= 2) {

            var ee0 = e.touches[0];
            var ee1 = e.touches[1];

            var x0 = ee0.pageX; var y0 = ee0.pageY; var x1 = ee1.pageX; var y1 = ee1.pageY;
            if (touchData.startTowSpot) {
                touchData.startTowSpot = false;
                var dx = x1 - x0;
                var dy = y1 - y0;
                touchData.dist = Math.sqrt(dx * dx + dy * dy);
            }
            touchmoveTwoSpot(x0, y0, x1, y1);
        }


    }, { passive: false });

    window.addEventListener("touchend", function (e) {
        if (gameData.gameStart) {
            e.preventDefault();
        }

        if (touchData.startTowSpot) {
            var ee = e.changedTouches[0];

            var tt = new Date().getTime();
            if (touchData.cnt == 2 && tt - touchData.time0 > 300) {
                touchData.cnt = 1;
            }
            if (touchData.cnt == 1) {
                touchData.cnt += 1;
                touchData.time0 = tt;
            }
            else if (touchData.cnt == 2) {
                touchData.time1 = tt;
                console.log(touchData.time1 - touchData.time0);
                if (touchData.time1 - touchData.time0 < 300) {
                    touchdbl(ee.pageX, ee.pageY);
                }
                touchData.cnt = 1;
            }
        }


        touchData.startTowSpot = true;

        var ee = e.changedTouches[0];
        touchup(ee.pageX, ee.pageY);
    }, { passive: false });

} else {
    //PC操作
    window.onmousedown = function (e) {
        mousedown(e.pageX, e.pageY);
    }
    window.onmousemove = function (e) {
        mousemove(e.pageX, e.pageY);
    }
    window.onmouseup = function (e) {
        mouseup(e.pageX, e.pageY);
    }
    window.ondblclick = function (e) {
        mousedblclick(e.pageX, e.pageY);
    }
}


window.onwheel = function (e) {
    if (e.wheelDelta > 0) {
        mousewheel(e.pageX, e.pageY, 1);
    } else {
        mousewheel(e.pageX, e.pageY, -1);
    }
}



export function inside(pos, lrp, w, h) {
    if (pos.x >= lrp.x && pos.x <= lrp.x + w && pos.y >= lrp.y && pos.y <= lrp.y + h) {
        return true;
    }

    return false;
}

export function convertInCanvas(pos) {
    var canvas = document.getElementById("canvas");
    var left = canvas.offsetLeft;
    var top = canvas.offsetTop;

    var ans = new Vec2();
    ans.x = pos.x - left;
    ans.y = pos.y - top;

    return ans;
}

export function convertInUICanvas(pos) {
    var canvas = document.getElementById("canvas_ui");
    var left = canvas.offsetLeft;
    var top = canvas.offsetTop;

    var ans = new Vec2();
    ans.x = pos.x - left;
    ans.y = pos.y - top;

    return ans;
}

export function insideCanvas(pos) {
    var canvas = document.getElementById("canvas");

    var w = canvas.offsetWidth;
    var h = canvas.offsetHeight;
    var left = canvas.offsetLeft;
    var top = canvas.offsetTop;

    var p = new Vec2();
    p.set(left, top);
    return inside(pos, p, w, h);
}

export function insideUICanvas(pos) {
    var canvas = document.getElementById("canvas_ui");

    var w = canvas.offsetWidth;
    var h = canvas.offsetHeight;
    var left = canvas.offsetLeft;
    var top = canvas.offsetTop;

    var p = new Vec2();
    p.set(left, top);
    return inside(pos, p, w, h);
}

function init() {
    webInit();

    initUI();

    mapInit();

    anchorInit();

    for (var i = 1; i <= 6; ++i) {
        var str = "src/chess_" + i + ".png"
        var sp = new Sprite(str);
        sprites_main.set(str, sp);
        players[i] = sp;
    }

    setInterval(main_update, 16);
}

function main_update() {
    draw_main();
    draw_ui();
    mapDataUpdate();
    uiUpdate();
}

//针对触控的操作
function touchdown(x, y) {
    mouseDown = true;
    touchStartPos.set(x, y);
    mapUpdateOnMouseDown(x, y);
}

function touchup(x, y) {
    mouseDown = false;
    touchEndPos.set(x, y);

    var p = new Vec2();
    p.set(x, y);

    updateUIOnMouseUp(p);
    anchorUpdate(p);
}

function touchmoveOneSpot(x, y) {
    var p = new Vec2();
    p.set(x, y);

    dragMoveMapOnMove(p);
}

function touchmoveTwoSpot(x0, y0, x1, y1) {
    var p0 = new Vec2();
    p0.set(x0, y0);

    var p1 = new Vec2();
    p1.set(x1, y1);

    var dx = x1 - x0;
    var dy = y1 - y0;
    var dd = Math.sqrt(dx * dx + dy * dy);

    var k = parseInt((dd - touchData.dist) / 30);
    if (Math.abs(k) >= 1) {
        touchData.dist = dd;
    }

    mapUpdateOnWheel(x0, y0, k);
    //dragMoveMapOnMove(p);
}

function touchdbl(x, y) {
    var p = new Vec2();
    p.set(x, y);

    playChessOnDblClick(p);
}

//针对鼠标的操作

function mousedown(x, y) {
    mouseDown = true;
    touchStartPos.set(x, y);
    mapUpdateOnMouseDown(x, y);
}

function mouseup(x, y) {
    mouseDown = false;
    touchEndPos.set(x, y);

    var p = new Vec2();
    p.set(x, y);

    updateUIOnMouseUp(p);
}

function mousemove(x, y) {
    var p = new Vec2();
    p.set(x, y);

    dragMoveMapOnMove(p);
    anchorUpdate(p);
}

function mousewheel(x, y, k) {
    mapUpdateOnWheel(x, y, k);
}

function mousedblclick(x, y) {
    var p = new Vec2();
    p.set(x, y);

    playChessOnDblClick(p);
}

function playChessOnDblClick(p) {
    if (insideCanvas(p)) {
        //检查现在是不是到自己操控的棋子
        var k = -1;
        for (var i = 0; i < gameData.selfChessCtl.length; ++i) {
            if (gameData.chessStepOn == gameData.selfChessCtl[i]) {
                k = gameData.chessStepOn;
            }
        }
        //不到自己
        if (k == -1) {
            return;
        }
        var mark;
        var cnt = 0;
        for (var i = 1; i <= 199; ++i) {
            var anc = anchors[i];
            if (anc.mouseon) {
                cnt += 1;
                mark = i;
            }
        }
        //保证鼠标只点击一个棋子
        if (cnt == 1) {
            playChess(mark, gameData.cardSelect);
        }
    }
}


function draw_main() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    ctx.fillStyle = "rgb(64, 61, 52)";
    ctx.fillRect(0, 0, 1200, 700);

    var arr = Array.from(sprites_main);
    arr.sort(function (a, b) {
        return a[1].z_order - b[1].z_order;
    });

    for (var i = 0; i < arr.length; ++i) {
        arr[i][1].visit(ctx);
    }

    //绘制游戏胜利显示
    if (gameData.gameWin != 0) {
        ctx.fillStyle = "rgb(40, 40, 40)";
        ctx.fillRect(300, 200, 600, 300);

        ctx.fillStyle = "rgb(255,255,255)";
        ctx.font = "100px Verdana";

        if (gameData.gameWin == 1) {
            ctx.fillText("警察胜利！", 300, 400);
        }
        if (gameData.gameWin == 2) {
            ctx.fillText("小偷胜利！", 300, 400);
        }
    }
}

var cardsDeckX = [0, 50, 105, 160, 220, 275];

function draw_ui() {
    var canvas = document.getElementById("canvas_ui");
    var ctx = canvas.getContext("2d");

    ctx.fillRect(0, 0, 350, 700);

    var arr = Array.from(sprites_ui);
    arr.sort(function (a, b) {
        return a[1].z_order - b[1].z_order;
    });

    for (var i = 0; i < arr.length; ++i) {
        arr[i][1].visit(ctx);
    }

    //显示卡片堆的数量
    var k = -1;
    for (var i = 0; i < gameData.selfChessCtl.length; ++i) {
        if (gameData.chessStepOn == gameData.selfChessCtl[i]) {
            k = gameData.chessStepOn;
        }
    }
    if (k != -1) {
        for (var i = 1; i <= 5; ++i) {
            ctx.save();
            var x = cardsDeckX[i];
            var y = 240;
            ctx.translate(x, y);

            ctx.scale(1, 1);

            ctx.fillStyle = "rgb(255,255,255)";
            ctx.font = "20px Verdana";

            var str;
            if (gameData.cardsLeft[k][i] < 10) {
                str = "0" + gameData.cardsLeft[k][i];
            } else {
                str = gameData.cardsLeft[k][i];
            }

            ctx.fillText(str, 0, 0);
            ctx.restore();
        }
    }
}

export var sprites_main, sprites_ui, mouseDown, touchStartPos, touchEndPos, anchors, players;
export var gameData;