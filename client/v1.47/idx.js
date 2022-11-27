'use strict';
import { Sprite } from "./webdraw/Sprite.js";
import { Label } from "./webdraw/Label.js";
import { Node } from "./webdraw/Node.js";
import { Vec2 } from "./webdraw/Vec2.js";
import { Size } from "./webdraw/Size.js";
import { DrawNode } from "./webdraw/DrawNode.js";
import { ImagePool } from "./webdraw/ImagePool.js";
import { Director, DirectorManager } from "./webdraw/Director.js";

import { initUI, updateUIOnMouseUp } from "./UICtl.js";

import { initMap, updateMapOnMove, updateMapOnMouseDown, mapUpdateOnWheel, mapUpdateOnTouchScale } from "./GameMap.js";

import { initAnchor } from "./Anchor.js";

import { web } from "./Web.js";

import { game } from "./Game.js";

let ele_canvas = document.getElementById("canvas");
let ele_canvas_ui = document.getElementById("canvas_ui");

let ele_GameLoadShow = document.getElementById("GameLoadShow");
let ele_GameLoadShow_loadbar = document.getElementById("GameLoadShow_loadbar");
let ele_GameLoadShow_loadinfo = document.getElementById("GameLoadShow_load_info");

var main_director, ui_director;

var touchStartPos = Vec2.new();
var touchEndPos = Vec2.new();
var mouseDown = false;


var renderData = new Object();
renderData.width = 1000;
renderData.height = 700;
renderData.zoom = 1.0;


window.onload = function () {
    init();
}

//触摸操作
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


    }, { passive: true });

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
    }, { passive: true });
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

//坐标转换函数
////////////////////////////////////////////////////

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
    let zoom = document.documentElement.style.zoom;

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

////////////////////////////////////////////////////

let gamePreLoadStep = 1;
let gamePreLoadStepSum = 12;

let gamePreLoadOnWait = false;
let gamePreLoadFinish = false;

let gamePreLoadFuncs = new Array();
for (let i = 1; i <= 13; ++i) {
    gamePreLoadFuncs[i] = new Object();

    gamePreLoadFuncs[i].isLast = true;
    gamePreLoadFuncs[i].info = "初始化完成";
    gamePreLoadFuncs[i].loadFunc = function () { };
    gamePreLoadFuncs[i].checkFunc = function () { return true; };
}

gamePreLoadFuncs[1].isLast = false;
gamePreLoadFuncs[1].info = "初始化缩放";
gamePreLoadFuncs[1].loadFunc = function () {
    initZoom();
};

gamePreLoadFuncs[2].isLast = false;
gamePreLoadFuncs[2].info = "正在连接服务器";
gamePreLoadFuncs[2].loadFunc = function () {
    //初始化网络
    web.init();
};
gamePreLoadFuncs[2].checkFunc = function () {
    if (web.isServerConnected()) {
        return true;
    }
    return false;
};

gamePreLoadFuncs[3].isLast = false;
gamePreLoadFuncs[3].info = "正在初始化渲染器";
gamePreLoadFuncs[3].loadFunc = function () {
    initDirector();
};

gamePreLoadFuncs[4].isLast = false;
gamePreLoadFuncs[4].info = "正在初始化界面";
gamePreLoadFuncs[4].loadFunc = function () {
    initUI();
};

gamePreLoadFuncs[5].isLast = false;
gamePreLoadFuncs[5].info = "正在初始化地图";
gamePreLoadFuncs[5].loadFunc = function () {
    initMap();
};

gamePreLoadFuncs[6].isLast = false;
gamePreLoadFuncs[6].info = "正在初始化锚点";
gamePreLoadFuncs[6].loadFunc = function () {
    initAnchor();
};

gamePreLoadFuncs[7].isLast = false;
gamePreLoadFuncs[7].info = "正在初始化棋子";
gamePreLoadFuncs[7].loadFunc = function () {
    initChess();
};

gamePreLoadFuncs[8].isLast = false;
gamePreLoadFuncs[8].info = "正在初始化胜利失败贴图";
gamePreLoadFuncs[8].loadFunc = function () {
    initVicDef();
};

gamePreLoadFuncs[9].isLast = false;
gamePreLoadFuncs[9].info = "正在初始化棋子选择";
gamePreLoadFuncs[9].loadFunc = function () {
    initCardSelect();
};

gamePreLoadFuncs[10].isLast = false;
gamePreLoadFuncs[10].info = "正在初始化游戏时钟";
gamePreLoadFuncs[10].loadFunc = function () {
    initGameClock();
};

gamePreLoadFuncs[11].isLast = false;
gamePreLoadFuncs[11].info = "正在初始化观战显示";
gamePreLoadFuncs[11].loadFunc = function () {
    initObserverShow();
};

gamePreLoadFuncs[12].isLast = false;
gamePreLoadFuncs[12].info = "正在启动主循环";
gamePreLoadFuncs[12].loadFunc = function () {
    initDirectorLoop();
};


function gamePreLoad() {
    if (gamePreLoadFinish) {
        return;
    }

    ele_GameLoadShow_loadbar.style.width = 500 * (gamePreLoadStep / gamePreLoadStepSum) + "px";
    //如果已经在等待加载，则检查是否成功加载
    if (gamePreLoadOnWait) {
        let success = false;
        //check
        success = gamePreLoadFuncs[gamePreLoadStep].checkFunc();

        if (success) {
            gamePreLoadStep += 1;
            gamePreLoadOnWait = false;
        }
    }

    if (!gamePreLoadOnWait) {
        ele_GameLoadShow_loadinfo.innerHTML = gamePreLoadFuncs[gamePreLoadStep].info;

        if (gamePreLoadFuncs[gamePreLoadStep].isLast) {

            //预加载界面消失
            //等待300ms再消失
            setTimeout(function () {

                ele_GameLoadShow.style.animation = "fadeout";
                ele_GameLoadShow.style.animationDuration = "0.3s";
                setTimeout(() => {
                    ele_GameLoadShow.style.display = "none";
                }, "290");

            }, "400");

            //ele_GameLoadShow

            gamePreLoadFinish = true;
            return;
        }

        gamePreLoadOnWait = true;
        gamePreLoadFuncs[gamePreLoadStep].loadFunc();
    }

}


function init() {

    setInterval(function () {
        gamePreLoad();
    }, 100);

}

function initZoom() {
    if (!isDevicePC) {
        renderData.zoom = 0.5;
    } else {
        renderData.zoom = 1.0;
    }
    //提前设置一次
    document.documentElement.style.zoom = renderData.zoom;
}

function initDirector() {
    main_director = DirectorManager.new_director(ele_canvas, 60);
    //用来更新渲染区域的大小
    let upd_node = Node.new();
    upd_node.add_schedule(function () {
        document.documentElement.style.zoom = renderData.zoom;

        let zoom = renderData.zoom;

        let doc_w = document.documentElement.clientWidth / zoom;
        let doc_h = document.documentElement.clientHeight / zoom;

        //更新宽度
        renderData.width = Math.max(1, doc_w - ele_canvas_ui.offsetWidth);
        ele_canvas_ui.style.left = renderData.width + "px";

        //更新高度
        renderData.height = doc_h - 10;

        //window.scrollTo({ top: 0, left: 0, behavior: "auto" });

        ele_canvas.width = renderData.width;
        ele_canvas.height = renderData.height;

    }, 1 / 20);
    main_director.add_child_with_key(upd_node, "upd_node_0");

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

    //更新UI渲染区域大小
    let upd_node_ui = Node.new();
    ui_director.add_child(upd_node_ui);

    upd_node_ui.add_schedule(function () {

        //更新UI位置的大小
        ele_canvas_ui.height = renderData.height;
    }, 1 / 60);
}

function initObserverShow() {
    let ob = Node.new();
    main_director.add_child_with_key(ob, "game_observer");
    ob.add_schedule(function () {
        if (game.isGameStart() && game.isObserver()) {
            ob.set_visible(true);
        } else {
            ob.set_visible(false);
        }
        ob.set_position_with_pos(renderData.width / 2 - 165 / 2, 0);
    }, 1 / 60);

    let bk = DrawNode.new();
    bk.add_rect(Vec2.with_pos(0, 0), 165, 60, true, "#f5f5dc");

    ob.add_child_with_key(bk, "bk");

    let tex = Label.with_font_color(36, "Verdana", "rgb(67, 65, 65)");
    ob.add_child_with_key(tex, "text");
    tex.set_position_with_pos(30, 40);

    tex.set_text("观战中");
}

function initGameClock() {

    let clock = Node.new();
    main_director.add_child_with_key(clock, "game_clock");

    clock.add_schedule(function () {
        if (game.isGameStart()) {
            clock.set_visible(true);
        } else {
            clock.set_visible(false);
        }

        clock.set_position_with_pos(renderData.width - 165, -10);
    }, 1 / 60);

    let bk = DrawNode.new();
    bk.add_rect(Vec2.with_pos(0, 0), 165, 60, true, "#f5f5dc");
    clock.add_child_with_key(bk, "bk");

    let time0 = Label.with_font_color(36, "Verdana", "rgb(67, 65, 65)");
    clock.add_child_with_key(time0, "time0");

    time0.set_text("00:00");
    time0.set_position_with_pos(10, 50);
    time0.add_schedule(function () {
        let str = "_1_:_2_";
        let t = game.getGameElapsedTime();

        //1 时钟
        let t1 = "" + parseInt(t / 3600);
        if (t1 < 10) {
            t1 = "0" + t1;
        }
        //2 分钟
        let t2 = "" + parseInt((t % 3600) / 60);
        if (t2 < 10) {
            t2 = "0" + t2;
        }

        str = str.replace(/_1_/, t1);
        str = str.replace(/_2_/, t2);

        time0.set_text(str);
    }, 1 / 60);

    let time1 = Label.with_font_color(20, "Verdana", "rgb(67, 65, 65)");
    clock.add_child_with_key(time1, "time1");

    time1.set_text(":00");
    time1.set_position_with_pos(120, 50);
    time1.add_schedule(function () {
        let str = ":_3_";
        let t = game.getGameElapsedTime();

        //3 秒钟
        let t3 = "" + parseInt(t % 60);
        if (t3 < 10) {
            t3 = "0" + t3;
        }
        str = str.replace(/_3_/, t3);

        time1.set_text(str);

    }, 1 / 60);
}

function initVicDef() {
    let vic = Sprite.new("src/victory.png");
    vic.add_schedule(function () {
        vic.set_position_with_pos(renderData.width / 2, renderData.height / 2);
    }, 1 / 60);
    vic.set_visible(false);
    vic.set_z_order(3);


    let def = Sprite.new("src/defeat.png");
    def.add_schedule(function () {
        def.set_position_with_pos(renderData.width / 2, renderData.height / 2);
    }, 1 / 60);
    def.set_visible(false);
    def.set_z_order(3);

    let bk = DrawNode.new();
    bk.set_visible(false);
    bk.set_opacity(0.6);
    bk.add_schedule(function () {
        bk.clear_shape();
        bk.add_rect(Vec2.with_pos(0, 0), renderData.width, renderData.height, true, "rgb(0,0,0)");
    }, 1 / 60);
    bk.set_z_order(2);

    main_director.add_child_with_key(vic, "victory");
    main_director.add_child_with_key(def, "defeat");
    main_director.add_child_with_key(bk, "vic_def_bk");

    let upd_node_1 = Node.new();
    main_director.add_child_with_key(upd_node_1, "upd_node_1");
    upd_node_1.add_schedule(function () {
        if (game.gameData.gameWin != 0) {
            bk.set_visible(true);
            if (game.gameData.gameWin == 1) {
                //警察赢，自己是警察
                if (!game.gameData.selfChessCtl.includes(1)) {
                    vic.set_visible(true);
                } else {
                    //警察赢，自己是小偷
                    def.set_visible(true);
                }
            }
            if (game.gameData.gameWin == 2) {

                //小偷赢，自己是小偷
                if (game.gameData.selfChessCtl.includes(1)) {
                    vic.set_visible(true);
                } else {
                    //小偷赢，自己是警察
                    def.set_visible(true);
                }
            }
        } else {
            vic.set_visible(false);
            def.set_visible(false);
            bk.set_visible(false);
        }
    }, 1 / 60);
}

function initCardSelect() {
    let scale_node = main_director.get_child_with_key("scale_node");
    let render_node = scale_node.get_child_with_key("render_node");

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

function initDirectorLoop() {
    main_director.start_loop();
    ui_director.start_loop();
}

//针对触控的操作
function touchdown(x, y) {
    mouseDown = true;
    let p = Vec2.with_pos(x, y);
    let zoom = document.documentElement.style.zoom;
    p.set_with_other(Vec2.scalar(p, 1 / zoom));


    touchStartPos.set_with_other(p);
    updateMapOnMouseDown(p);
}

function touchup(x, y) {
    mouseDown = false;
    let p = Vec2.with_pos(x, y);
    let zoom = document.documentElement.style.zoom;
    p.set_with_other(Vec2.scalar(p, 1 / zoom));

    touchEndPos.set_with_other(p);

    updateCardSelectOnMouseUp(p);
    updateUIOnMouseUp(p);
    updateMapOnMove(p);
}

function touchmoveOneSpot(x, y) {
    let p = Vec2.with_pos(x, y);
    let zoom = document.documentElement.style.zoom;
    p.set_with_other(Vec2.scalar(p, 1 / zoom));


    updateMapOnMove(p);
}

function touchmoveTwoSpot(x0, y0, x1, y1) {
    let p0 = Vec2.with_pos(x0, y0);

    let p1 = Vec2.with_pos(x1, y1);

    let zoom = document.documentElement.style.zoom;
    p0.set_with_other(Vec2.scalar(p0, 1 / zoom));

    p1.set_with_other(Vec2.scalar(p1, 1 / zoom));


    let dx = x1 - x0;
    let dy = y1 - y0;
    let dd = Math.sqrt(dx * dx + dy * dy);

    let k = parseInt((dd - touchData.dist) / 5);
    if (Math.abs(k) >= 1) {
        touchData.dist = dd;
    }

    mapUpdateOnTouchScale(p0, k);
    //dragMoveMapOnMove(p);
}

function touchdbl(x, y) {
    var p = Vec2.with_pos(x, y);
    let zoom = document.documentElement.style.zoom;

    p.set_with_other(Vec2.scalar(p, 1 / zoom));

    playChessOnDblClick(p);
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
    updateUIOnMouseUp(p);
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
        let mark;
        let cnt = 0;

        let scale_node = main_director.get_child_with_key("scale_node");
        let render_node = scale_node.get_child_with_key("render_node");

        for (let i = 1; i <= 199; ++i) {
            var str = `anchor_${i}`;

            let anc = render_node.get_child_with_key(str);
            let mouseon = anc.get_component_with_key("mouse_on");
            if (mouseon) {
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


export var main_director, ui_director, mouseDown, touchStartPos, touchEndPos, renderData, isDevicePC;