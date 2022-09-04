'use strict';
import { Sprite } from "./webdraw/Sprite.js";
import { Label } from "./webdraw/Label.js";
import { Node } from "./webdraw/Node.js";
import { Vec2 } from "./webdraw/Vec2.js";
import { Size } from "./webdraw/Size.js";
import { ImagePool } from "./webdraw/ImagePool.js";
import { Director, DirectorManager } from "./webdraw/Director.js";

import { initUI } from "./UICtl.js";

import { initMap, updateMapOnMove, updateMapOnMouseDown, mapUpdateOnWheel } from "./GameMap.js";

import { initAnchor } from "./Anchor.js";

import { web } from "./Web.js";

import { game } from "./Game.js";

import { uiCtlCanMoveMap } from "./MenuUI.js";

let ele_canvas = document.getElementById("canvas");
let ele_canvas_ui = document.getElementById("canvas_ui");

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
    let left = ele_canvas.offsetLeft;
    let top = ele_canvas.offsetTop;

    let ans = Vec2.new();
    ans.x = pos.x - left;
    ans.y = pos.y - top;

    return ans;
}

export function convertInUICanvas(pos) {
    let left = ele_canvas_ui.offsetLeft;
    let top = ele_canvas_ui.offsetTop;

    let ans = Vec2.new();
    ans.x = pos.x - left;
    ans.y = pos.y - top;

    return ans;
}

export function insideCanvas(pos) {

    let w = ele_canvas.offsetWidth;
    let h = ele_canvas.offsetHeight;
    let left = ele_canvas.offsetLeft;
    let top = ele_canvas.offsetTop;

    let p = Vec2.new();
    p.set_with_pos(left, top);
    return inside(pos, p, w, h);
}

export function insideUICanvas(pos) {

    let w = ele_canvas_ui.offsetWidth;
    let h = ele_canvas_ui.offsetHeight;
    let left = ele_canvas_ui.offsetLeft;
    let top = ele_canvas_ui.offsetTop;

    let p = Vec2.new();
    p.set_with_pos(left, top);
    return inside(pos, p, w, h);
}

function init() {
    main_director = DirectorManager.new_director(ele_canvas, 60);
    //用来更新渲染区域的大小
    let upd_node = Node.new();
    upd_node.add_schedule(function () {

        renderData.width = Math.max(1, window.innerWidth - ele_canvas_ui.offsetWidth - 50);
        ele_canvas_ui.style.left = renderData.width + 30 + "px";

        window.scrollTo({ top: 0, left: 0, behavior: "auto" });


        ele_canvas.width = renderData.width;
        ele_canvas.height = renderData.height;

    }, 1 / 60.0, 0);
    main_director.add_child_with_key(upd_node, "upd_node");

    //所有需要使用滚轮缩放的内容都添加进render_node
    let render_node = Node.new();

    let scale_node = Node.new();
    scale_node.set_anchor_with_pos(0.5, 0.5);
    scale_node.add_schedule(function () {
        scale_node.set_size_with_size(renderData.width, renderData.height);
        scale_node.set_position_with_pos(renderData.width / 2, renderData.height / 2);
    }, 1 / 60.0, 0);
    scale_node.add_child_with_key(render_node, "render_node");

    main_director.add_child_with_key(scale_node, "scale_node");


    ui_director = DirectorManager.new_director(ele_canvas_ui, 60);

    initUI();

    initMap();

    initAnchor();

    //初始化棋子
    initChess();

    //初始化胜利与失败显示
    let vic = Sprite.new("src/victory.png");
    vic.set_visible(false);
    vic.set_z_order(3);
    let def = Sprite.new("src/defeat.png");
    def.set_visible(false);
    def.set_z_order(3);

    main_director.add_child_with_key(vic, "victory");
    main_director.add_child_with_key(def, "defeat");

    //初始化棋子选择
    let card_select_node = Node.new();
    card_select_node.set_position_with_pos(0, 60);
    card_select_node.add_schedule(function () {
        let sp = card_select_node.get_child_with_key("bar");
        card_select_node.set_size_with_other(sp.get_scaled_size());

        let p = card_select_node.get_position();
        p.x = renderData.width / 2;

        card_select_node.set_position_with_other(p);

        if (game.isGameStart() && game.onMyStep()) {
            card_select_node.set_visible(true);
        } else {
            card_select_node.set_visible(false);
        }
    }, 1 / 60);

    card_select_node.add_component_with_key([0, 5, 100, 193, 288, 382, 600], "deck_x");

    main_director.add_child_with_key(card_select_node, "card_select");

    let card_select_bar = Sprite.new("src/card_select_bar.png");
    card_select_bar.set_position_with_pos(0, 10);

    let card_select = Sprite.new("src/card_select.png");
    card_select.set_anchor_with_pos(0, 0.5);
    card_select.add_schedule(function () {
        let card_x = card_select_node.get_component_with_key("deck_x");
        let x = card_x[game.gameData.cardSelect];

        let p = card_select.get_position();
        p.x = x - card_select_bar.get_size().w / 2;

        card_select.set_position_with_other(p);

    }, 1 / 60);
    card_select.set_position_with_pos(0, 10);

    card_select_node.add_child_with_key(card_select_bar, "bar");
    card_select_node.add_child_with_key(card_select, "select");


    //初始化网络
    web.init();

    //setInterval(main_update, 15);
}

function initChess() {
    let scale_node = main_director.get_child_with_key("scale_node");
    let render_node = scale_node.get_child_with_key("render_node");

    for (let i = 1; i <= 6; ++i) {
        let str = "src/chess_" + i + ".png"
        let sp = Sprite.new(str);

        sp.set_anchor_with_pos(0.5, 0.7);

        render_node.add_child_with_key(sp, `player_${i}`);
    }
}

function main_update() {



    // //设置胜利与失败显示位置
    // let vic = sprites_main.get("victory");
    // vic.pos.x = renderData.width / 2 - vic.width() / 2;
    // vic.pos.y = renderData.height / 2 - vic.height() / 2;

    // let def = sprites_main.get("defeat");
    // def.pos.x = renderData.width / 2 - def.width() / 2;
    // def.pos.y = renderData.height / 2 - def.height() / 2;

    // let blackBk = sprites_main.get("blackBk");
    // blackBk.w = renderData.width;
    // blackBk.h = renderData.height;

    //设置卡片选择位置
    // const pp = [0, 5, 100, 193, 288, 382];
    // let card_select_bar = sprites_main.get("card_select_bar");
    // let card_select = sprites_main.get("card_select");
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



//针对鼠标的操作

function mousedown(x, y) {
    mouseDown = true;
    let p = Vec2.with_pos(x, y);

    touchStartPos.set_with_other(p);
    updateMapOnMouseDown(p);
}

function mouseup(x, y) {
    mouseDown = false;
    let p = Vec2.with_pos(x, y);

    touchEndPos.set_with_other(p);

    updateCardSelectOnMouseUp(p);
    //updateUIOnMouseUp(p);
}

function mousemove(x, y) {
    let p = Vec2.with_pos(x, y);

    updateMapOnMove(p);
}

function mousewheel(x, y, k) {
    let p = Vec2.with_pos(x, y);

    mapUpdateOnWheel(p, k);
}

function mousedblclick(x, y) {
    let p = Vec2.with_pos(x, y);

    playChessOnDblClick(p);
}

function updateCardSelectOnMouseUp(p) {

    if (!game.onMyStep() || !game.isGameStart()) {
        return;
    }
    if (!insideCanvas(p)) {
        return;
    }

    let p1 = convertInCanvas(p);
    let card_select_node = main_director.get_child_with_key("card_select");

    let bar = card_select_node.get_child_with_key("bar");
    let size = bar.get_scaled_size();

    let p2 = Vec2.sub(card_select_node.get_position(), Vec2.with_pos(size.w / 2, size.h / 2));
    if (inside(p1, p2,
        size.w, size.h)) {

        let pp = card_select_node.get_component_with_key("deck_x");

        let dx = p1.x - p2.x;
        for (let i = 1; i <= 5; ++i) {
            if (dx >= pp[i] && dx < pp[i + 1]) {
                game.setCardSelect(i);
                break;
            }
        }
    }
}

function playChessOnDblClick(p) {
    if (insideCanvas(p)) {
        // let mark;
        // let cnt = 0;
        // for (let i = 1; i <= 199; ++i) {
        //     let anc = anchors[i];
        //     if (anc.mouseon) {
        //         cnt += 1;
        //         mark = i;
        //     }
        // }

        // //保证鼠标只点击一个棋子
        // if (cnt == 1) {
        //     game.playChess(mark);
        // }
    }
}


export var main_director, ui_director, mouseDown, touchStartPos, touchEndPos, renderData, isDevicePC;