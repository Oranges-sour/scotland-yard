'use strict';
import Sprite from "./Sprite.js"
import Vec2 from "./Vec2.js";


import { mapDataUpdate, dragMoveMapOnMove, mapInit, mapUpdateOnWheel, mapUpdateOnMouseDown } from "./GameMap.js"
import { anchorInit, anchorUpdate } from "./Anchor.js";

import { initUI, uiUpdate, updateUIOnMouseUp } from "./UICtl.js";

import { web } from "./Web.js";

import { game } from "./Game.js";

import { uiCtlCanMoveMap } from "./MenuUI.js";

var ele_canvas = document.getElementById("canvas");
var ele_canvas_ui = document.getElementById("canvas_ui");

var sprites_main = new Map();
var sprites_ui = new Map();


var anchors = new Array();
var players = new Array();


var touchStartPos = new Vec2();
var touchEndPos = new Vec2();
var mouseDown = false;


var renderData = new Object();
renderData.width = 1000;
renderData.height = 700;


window.onload = function () {
    init();
}

var touchData = new Object();
touchData.sUserAgent = navigator.userAgent.toLowerCase();
touchData.time0 = 0, touchData.time1 = 0, touchData.cnt = 1;
touchData.startTowSpot = true;
touchData.dist = 0;
var isDevicePC = true;

if (/ipad|iphone|midp|rv:1.2.3.4|ucweb|android|windows ce|windows mobile/.test(touchData.sUserAgent)) {
    isDevicePC = false;
    console.log("phone");
    window.ontouchstart = function (e) {
        var e = e.touches[0];
        touchdown(e.pageX, e.pageY);
    }
    window.addEventListener("touchmove", function (e) {
        if (uiCtlCanMoveMap()) {
            return;
        }
        if (game.isGameStart()) {
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
    var left = ele_canvas.offsetLeft;
    var top = ele_canvas.offsetTop;

    var ans = new Vec2();
    ans.x = pos.x - left;
    ans.y = pos.y - top;

    return ans;
}

export function convertInUICanvas(pos) {
    var left = ele_canvas_ui.offsetLeft;
    var top = ele_canvas_ui.offsetTop;

    var ans = new Vec2();
    ans.x = pos.x - left;
    ans.y = pos.y - top;

    return ans;
}

export function insideCanvas(pos) {

    var w = ele_canvas.offsetWidth;
    var h = ele_canvas.offsetHeight;
    var left = ele_canvas.offsetLeft;
    var top = ele_canvas.offsetTop;

    var p = new Vec2();
    p.set(left, top);
    return inside(pos, p, w, h);
}

export function insideUICanvas(pos) {

    var w = ele_canvas_ui.offsetWidth;
    var h = ele_canvas_ui.offsetHeight;
    var left = ele_canvas_ui.offsetLeft;
    var top = ele_canvas_ui.offsetTop;

    var p = new Vec2();
    p.set(left, top);
    return inside(pos, p, w, h);
}

function init() {

    initUI();

    mapInit();

    anchorInit();

    //初始化棋子
    for (var i = 1; i <= 6; ++i) {
        var str = "src/chess_" + i + ".png"
        var sp = new Sprite(str);
        sprites_main.set(str, sp);
        players[i] = sp;
    }

    //初始化胜利与失败显示
    var vic = new Sprite("src/victory.png");
    vic.visible = false;
    var def = new Sprite("src/defeat.png");
    def.visible = false;

    sprites_main.set("victory", vic);
    sprites_main.set("defeat", def);

    web.init();

    setInterval(main_update, 32);
}

function main_update() {
    renderData.width = window.innerWidth - ele_canvas_ui.offsetWidth - 50;
    ele_canvas_ui.style.left = renderData.width + 30 + "px";

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });


    ele_canvas.width = renderData.width;
    ele_canvas.height = renderData.height;

    //设置胜利与失败显示位置
    var vic = sprites_main.get("victory");
    vic.pos.x = renderData.width / 2 - vic.width() / 2;
    vic.pos.y = renderData.height / 2 - vic.height() / 2;

    var def = sprites_main.get("defeat");
    def.pos.x = renderData.width / 2 - def.width() / 2;
    def.pos.y = renderData.height / 2 - def.height() / 2;

    //绘制游戏胜利显示
    if (game.gameData.gameWin != 0) {
        if (game.gameData.gameWin == 1 && !game.gameData.selfChessCtl.includes(1)) {
            vic.visible = true;
        }
        if (game.gameData.gameWin == 2 && game.gameData.selfChessCtl.includes(1)) {
            def.visible = true;
        }
    } else {
        vic.visible = false;
        def.visible = false;
    }

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
            game.playChess(mark);
        }
    }
}


function draw_main() {
    var ctx = ele_canvas.getContext("2d");

    ctx.fillStyle = "rgb(64, 61, 52)";
    ctx.fillRect(0, 0, renderData.width, renderData.height);

    var arr = Array.from(sprites_main);
    arr.sort(function (a, b) {
        return a[1].z_order - b[1].z_order;
    });

    for (var i = 0; i < arr.length; ++i) {
        arr[i][1].visit(ctx);
    }

    //绘制观战提示
    if (game.isObserver()) {
        ctx.fillStyle = "rgb(239, 233, 218)";
        const w = 150;
        const h = 80;
        ctx.fillRect(renderData.width / 2 - w / 2, 0, w, h);

        ctx.fillStyle = "rgb(67, 65, 65)";
        ctx.font = "40px Verdana";


        ctx.fillText("观战中", renderData.width / 2 - w / 2, 50);
    }
}

var cardsDeckX = [0, 50, 105, 160, 220, 275];

function draw_ui() {
    var ctx = ele_canvas_ui.getContext("2d");

    ctx.fillRect(0, 0, 350, 700);

    var arr = Array.from(sprites_ui);
    arr.sort(function (a, b) {
        return a[1].z_order - b[1].z_order;
    });

    for (var i = 0; i < arr.length; ++i) {
        arr[i][1].visit(ctx);
    }

    //到自己下棋
    if (game.onMyStep()) {
        var k = game.gameData.chessStepOn;

        for (var i = 1; i <= 5; ++i) {
            ctx.save();
            var x = cardsDeckX[i];
            var y = 240;
            ctx.translate(x, y);

            ctx.scale(1, 1);

            ctx.fillStyle = "rgb(255,255,255)";
            ctx.font = "20px Verdana";

            var str;
            if (game.gameData.cardsLeft[k][i] < 10) {
                str = "0" + game.gameData.cardsLeft[k][i];
            } else {
                str = game.gameData.cardsLeft[k][i];
            }

            ctx.fillText(str, 0, 0);
            ctx.restore();
        }
    }

    //观战位
    if (game.isObserver()) {
        //到谁显示谁
        var k = game.gameData.chessStepOn;
        for (var i = 1; i <= 5; ++i) {
            ctx.save();
            var x = cardsDeckX[i];
            var y = 240;
            ctx.translate(x, y);

            ctx.scale(1, 1);

            ctx.fillStyle = "rgb(255,255,255)";
            ctx.font = "20px Verdana";

            var str;
            if (game.gameData.cardsLeft[k][i] < 10) {
                str = "0" + game.gameData.cardsLeft[k][i];
            } else {
                str = game.gameData.cardsLeft[k][i];
            }

            ctx.fillText(str, 0, 0);
            ctx.restore();
        }
    }


}

export var sprites_main, sprites_ui, mouseDown, touchStartPos, touchEndPos, anchors, players, renderData, isDevicePC;