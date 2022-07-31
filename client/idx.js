'use strict'
import Sprite from "./Sprite.js"
import Vec2 from "./Vec2.js";


import { GameMap, mapDataUpdate, dragMoveMapOnMove, mapInit, mapUpdateOnWheel, mapUpdateOnMouseDown } from "./Map.js"
import { Anchor, anchorInit, anchorUpdate } from "./Anchor.js";

import { initUI, uiUpdate, updateUIOnMouseUp } from "./uiCtl.js";

import { webInit, playChess, resetGame } from "./web.js";

// import { anchorData } from "./Anchor.js";

var sprites_main = new Map();
var sprites_ui = new Map();


var anchors = new Array();
var players = new Array();

var gameMap = new GameMap();


var touchStartPos = new Vec2();
var touchEndPos = new Vec2();
var mouseDown = false;

//游戏局
var gameRound = 1;
//当前选择了哪个卡子
var cardSelect = 1;
//到谁下棋
var chessStepOn = 1;
//小偷行动的步骤
var thiefStepList = new Array();
for (var i = 1; i <= 24; ++i) {
    thiefStepList[i] = 1;
}

//控制的棋子
var selfChessCtl = [1, 2, 3, 4, 5, 6];

var cardsLeft = new Array();
for (var i = 1; i <= 6; ++i) {
    cardsLeft[i] = new Array();
    for (var j = 1; j <= 5; ++j) {
        cardsLeft[i][j] = 0;
    }
}


window.onload = function () {
    init();
}
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

export function updateGameStatue(obj) {
    cardsLeft = obj.cardsLeft;
    thiefStepList = obj.thiefStepList;
    chessStepOn = obj.chessStepOn;
    gameMap.playerAt = obj.playerAt;
    gameRound = obj.gameRound;
}

export function setChessSelect(x) {
    cardSelect = x;
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
        for (var i = 0; i < selfChessCtl.length; ++i) {
            if (chessStepOn == selfChessCtl[i]) {
                k = chessStepOn;
            }
        }
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
            playChess(mark, cardSelect);
        }
    }
}


function draw_main() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    ctx.fillRect(0, 0, 1200, 700);

    var arr = Array.from(sprites_main);
    arr.sort(function (a, b) {
        return a[1].z_order - b[1].z_order;
    });

    for (var i = 0; i < arr.length; ++i) {
        arr[i][1].visit(ctx, 700);
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
        arr[i][1].visit(ctx, 700);
    }

    //显示卡片堆的数量
    var k = -1;
    for (var i = 0; i < selfChessCtl.length; ++i) {
        if (chessStepOn == selfChessCtl[i]) {
            k = chessStepOn;
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
            if (cardsLeft[k][i] < 10) {
                str = "0" + cardsLeft[k][i];
            } else {
                str = cardsLeft[k][i];
            }

            ctx.fillText(str, 0, 0);
            ctx.restore();
        }
    }
}

export var sprites_main, sprites_ui, mouseDown, touchStartPos, touchEndPos, anchors, gameMap, players;
export var cardSelect;
export var chessStepOn;
export var thiefStepList;
export var cardsLeft;
export var gameRound;
export var selfChessCtl;