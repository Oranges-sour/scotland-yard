import { Sprite } from "./webdraw/Sprite.js";
import { Label } from "./webdraw/Label.js";
import { Node } from "./webdraw/Node.js";
import { Vec2 } from "./webdraw/Vec2.js";
import { ImagePool } from "./webdraw/ImagePool.js";
import { Director, DirectorManager } from "./webdraw/Director.js";

import { initUI } from "./UICtl.js";

import { initMap, dragMoveMapOnMove, mapDataUpdate } from "./GameMap.js";

import { initAnchor } from "./Anchor.js";

import { web } from "./Web.js";

import { game } from "./Game.js";

import { uiCtlCanMoveMap } from "./MenuUI.js";

var ele_canvas = document.getElementById("canvas");
var ele_canvas_ui = document.getElementById("canvas_ui");

var main_director, ui_director;

var touchStartPos = Vec2.new();
var touchEndPos = Vec2.new();
var mouseDown = false;


var renderData = new Object();
renderData.width = 1000;
renderData.height = 700;


window.onload = function () {
    init();
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

    var ans = Vec2.new();
    ans.x = pos.x - left;
    ans.y = pos.y - top;

    return ans;
}

export function convertInUICanvas(pos) {
    var left = ele_canvas_ui.offsetLeft;
    var top = ele_canvas_ui.offsetTop;

    var ans = Vec2.new();
    ans.x = pos.x - left;
    ans.y = pos.y - top;

    return ans;
}

export function insideCanvas(pos) {

    var w = ele_canvas.offsetWidth;
    var h = ele_canvas.offsetHeight;
    var left = ele_canvas.offsetLeft;
    var top = ele_canvas.offsetTop;

    var p = Vec2.new();
    p.set_with_pos(left, top);
    return inside(pos, p, w, h);
}

export function insideUICanvas(pos) {

    var w = ele_canvas_ui.offsetWidth;
    var h = ele_canvas_ui.offsetHeight;
    var left = ele_canvas_ui.offsetLeft;
    var top = ele_canvas_ui.offsetTop;

    var p = Vec2.new();
    p.set_with_pos(left, top);
    return inside(pos, p, w, h);
}

function init() {
    main_director = DirectorManager.new_director(ele_canvas, 60);
    //用来更新渲染区域的大小
    var upd_node = Node.new();
    upd_node.add_schedule(function () {

        renderData.width = Math.max(1, window.innerWidth - ele_canvas_ui.offsetWidth - 50);
        ele_canvas_ui.style.left = renderData.width + 30 + "px";

        window.scrollTo({ top: 0, left: 0, behavior: "auto" });


        ele_canvas.width = renderData.width;
        ele_canvas.height = renderData.height;

    }, 1 / 60.0, 0);
    main_director.add_child_with_key(upd_node, "upd_node");

    //所有需要使用滚轮缩放的内容都添加进render_node
    var render_node = Node.new();
    render_node.set_anchor_with_pos(0.5, 0.5);
    render_node.add_schedule(function () {
        render_node.set_size_with_size(renderData.width, renderData.height);
    }, 1 / 60.0, 0);
    main_director.add_child_with_key(render_node, "render_node");



    ui_director = DirectorManager.new_director(ele_canvas_ui, 60);

    initUI();

    initMap();

    initAnchor();

    //初始化棋子
    for (var i = 1; i <= 6; ++i) {
        var str = "src/chess_" + i + ".png"
        var sp = Sprite.new(str);

        render_node.add_child_with_key(sp, `player_${i}`);
    }

    //初始化胜利与失败显示
    var vic = Sprite.new("src/victory.png");
    vic.set_visible(false);
    vic.set_z_order(3);
    var def = Sprite.new("src/defeat.png");
    def.set_visible(false);
    def.set_z_order(3);

    main_director.add_child_with_key(vic, "victory");
    main_director.add_child_with_key(def, "defeat");

    //初始化棋子选择
    var card_select = Node.new();
    main_director.add_child_with_key(card_select, "card_select");


    var card_select_bar = Sprite.new("src/card_select_bar.png");
    card_select_bar.set_position_with_pos(0, 10);

    card_select_bar.z_order = 4;
    var card_select = new Sprite("src/card_select.png");
    card_select.pos.set(0, 18);
    card_select.z_order = 4;
    sprites_main.set("card_select_bar", card_select_bar);
    sprites_main.set("card_select", card_select);

    //初始化网络
    web.init();

    //setInterval(main_update, 15);
}

function main_update() {



    // //设置胜利与失败显示位置
    // var vic = sprites_main.get("victory");
    // vic.pos.x = renderData.width / 2 - vic.width() / 2;
    // vic.pos.y = renderData.height / 2 - vic.height() / 2;

    // var def = sprites_main.get("defeat");
    // def.pos.x = renderData.width / 2 - def.width() / 2;
    // def.pos.y = renderData.height / 2 - def.height() / 2;

    // var blackBk = sprites_main.get("blackBk");
    // blackBk.w = renderData.width;
    // blackBk.h = renderData.height;

    //设置卡片选择位置
    // const pp = [0, 5, 100, 193, 288, 382];
    // var card_select_bar = sprites_main.get("card_select_bar");
    // var card_select = sprites_main.get("card_select");
    // card_select_bar.pos.x = renderData.width / 2 - card_select_bar.width() / 2;
    // card_select.pos.x = card_select_bar.pos.x + pp[game.gameData.cardSelect];

    // if (game.onMyStep() && game.isGameStart() && game.gameData.gameWin == 0) {
    //     card_select_bar.visible = true;
    //     card_select.visible = true;
    // } else {
    //     card_select_bar.visible = false;
    //     card_select.visible = false;
    // }


    //绘制游戏胜利显示
    // if (game.gameData.gameWin != 0) {
    //     blackBk.visible = true;
    //     if (game.gameData.gameWin == 1) {

    //         //警察赢，自己是警察
    //         if (!game.gameData.selfChessCtl.includes(1)) {
    //             vic.visible = true;
    //         } else {
    //             //警察赢，自己是小偷
    //             def.visible = true;
    //         }
    //     }
    //     if (game.gameData.gameWin == 2) {

    //         //小偷赢，自己是小偷
    //         if (game.gameData.selfChessCtl.includes(1)) {
    //             vic.visible = true;
    //         } else {
    //             //小偷赢，自己是警察
    //             def.visible = true;
    //         }
    //     }
    // } else {
    //     vic.visible = false;
    //     def.visible = false;
    //     blackBk.visible = false;
    // }

    //draw_main();
    //draw_ui();
    //mapDataUpdate();
    //uiUpdate();
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
    updateCardSelectOnMouseUp(p);
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

    updateCardSelectOnMouseUp(p);
    updateUIOnMouseUp(p);
}

function mousemove(x, y) {
    var p = Vec2.new();
    p.set_with_pos(x, y);

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

function updateCardSelectOnMouseUp(p) {

    if (!game.onMyStep() || !game.isGameStart()) {
        return;
    }
    if (!insideCanvas(p)) {
        return;
    }

    var p = convertInCanvas(p);
    var card_select_bar = sprites_main.get("card_select_bar");
    if (inside(p, card_select_bar.pos,
        card_select_bar.width(), card_select_bar.height())) {

        const pp = [0, 5, 100, 193, 288, 382, 600];

        var dx = p.x - card_select_bar.pos.x;
        for (var i = 1; i <= 5; ++i) {
            if (dx >= pp[i] && dx < pp[i + 1]) {
                game.setCardSelect(i);
                break;
            }
        }
    }
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


var cardsDeckX = [0, 50, 105, 160, 220, 275];


export var main_director, ui_director, mouseDown, touchStartPos, touchEndPos, renderData, isDevicePC;