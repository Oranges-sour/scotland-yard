'use strict'
import Sprite from "./Sprite.js"
import Vec2 from "./Vec2.js";
import Anchor from "./Anchor.js"
import GameMap from "./Map.js"

import { anchorData } from "./Anchor.js";

var sprites = new Map();

var anchors = new Array();

var mapData = new Object;
mapData.touchStartMapPos = new Vec2();
mapData.mapPos = new Vec2();
mapData.scale = 1.0;

var gameMap = new GameMap();


var touchStartPos = new Vec2();
var touchEndPos = new Vec2();
var mouseDown = false;



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

window.onwheel = function (e) {
    if (e.wheelDelta > 0) {
        mousewheel(1);
    } else {
        mousewheel(-1);
    }
}

function inside(pos, lrp, w, h) {
    if (pos.x >= lrp.x && pos.x <= lrp.x + w && pos.y >= lrp.y && pos.y <= lrp.y + h) {
        return true;
    }

    return false;
}

function convertInCanvas(pos) {
    var canvas = document.getElementById("canvas");
    var left = canvas.offsetLeft;
    var top = canvas.offsetTop;

    var ans = new Vec2();
    ans.x = pos.x - left;
    ans.y = pos.y - top;

    return ans;
}

function insideCanvas(pos) {
    var canvas = document.getElementById("canvas");

    var w = canvas.offsetWidth;
    var h = canvas.offsetHeight;
    var left = canvas.offsetLeft;
    var top = canvas.offsetTop;

    var p = new Vec2();
    p.set(left, top);
    return inside(pos, p, w, h);
}

function init() {
    var sp = new Sprite("src/map1.jpg");

    sprites.set("game_map", sp);

    // mapData.scale = 0.3;

    mapData.mapPos.set(-2800, -2800);

    for (var i = 1; i <= 199; ++i) {
        var sp1 = new Anchor(anchorData[i].type, i);

        sp1.orgPos.x = anchorData[i].x;
        sp1.orgPos.y = anchorData[i].y;

        sp1.scale = 0.3;

        sprites.set(i, sp1);

        anchors[i] = sp1;
    }


    setInterval(main_update, 16);


    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
}

function main_update() {
    draw();
    mapDataUpdate();
}

function mousedown(x, y) {
    mouseDown = true;
    touchStartPos.set(x, y);

    mapData.touchStartMapPos.set_p(mapData.mapPos);
}

function mouseup(x, y) {
    mouseDown = false;
    touchEndPos.set(x, y);
}

function mousemove(x, y) {
    var p = new Vec2();
    p.set(x, y);
    dragMoveMapOnMove(p);
    anchorUpdate(p);
}

function mousewheel(k) {
    const CS = 0.05;

    mapData.scale += CS * k;

    mapData.scale = Math.max(0.1, mapData.scale);
    mapData.scale = Math.min(2, mapData.scale);
}

function mapDataUpdate() {
    var e = sprites.get("game_map");

    function calcuSpeed(x, a, b) {
        return (x * x) / (b * (x + a));
    }

    //检查拖动
    //var w = e.img.width * e.scale;
    //var h = e.img.height * e.scale;
    //左侧
    //mapData.mapPos.x = Math.min(mapData.mapPos.x, w / 4);
    //右侧
    //mapData.mapPos.x = Math.max(mapData.mapPos.x, -w / 4);
    //上侧
    //mapData.mapPos.y = Math.max(mapData.mapPos.y, -h / 4);
    //下侧
    //mapData.mapPos.y = Math.min(mapData.mapPos.y, h / 4);

    //计算地图移动
    {
        var nowPos = e.pos.copy();
        var dPos = mapData.mapPos.add(nowPos.negtive());
        var dis = dPos.dist();

        var speed = calcuSpeed(dis, 3, 5);
        var dx = nowPos.add(dPos.normal().plus_n(speed));
        if (speed <= 0.003) {
            dx = nowPos.add(dPos);
        }

        e.pos.set_p(dx);
    }

    //检查缩放
    {
        var centerPos = new Vec2();
        centerPos.set(600, 350);

        var deltaSc = mapData.scale - e.scale;
        var abs_deltaSc = Math.abs(deltaSc);

        if (abs_deltaSc >= 0.00001) {
            var sp = calcuSpeed(abs_deltaSc * 100, 3, 5) / 100;
            if (abs_deltaSc <= 0.005) {
                mapData.scale = e.scale;
            }

            var flag = deltaSc / abs_deltaSc;
            var tar = e.scale + flag * sp;

            var p0 = centerPos.add(mapData.mapPos.negtive());

            var p1 = p0.plus_n(1 / e.scale);
            e.scale = tar;
            var p2 = p1.plus_n(tar);

            var deltaP = p0.add(p2.negtive());

            mapData.mapPos = mapData.mapPos.add(deltaP);
            e.pos.set_p(mapData.mapPos);
        }

        var p0 = new Vec2();
        p0.set(190 / 2, 210 / 2);

        var arr = new Set();
        for (var i = 1; i <= 199; ++i) {
            var anc = anchors[i];
            if (anc.mouseon) {
                arr = gameMap.allcango(3, i);
            }
        }

        for (var i = 1; i <= 199; ++i) {
            var anc = anchors[i];

            p0.set(190 / 2, 210 / 2);

            if (!anc.mouseon) {
                anc.scale = Math.max(e.scale, 0.2);
            } else {
                anc.scale = Math.max(e.scale + 0.1, 0.3);
            }

            if (arr.has(i)) {
                anc.scale = Math.max(e.scale + 0.15, 0.35);
            }


            p0 = p0.plus_n(-1 * anc.scale);
            var p1 = anc.orgPos.plus_n(e.scale);
            var p2 = p1.add(e.pos).add(p0);
            anc.pos.set_p(p2);
        }
    }
}


function dragMoveMapOnMove(p) {
    if (mouseDown) {
        if (insideCanvas(p)) {
            var dx = touchStartPos.add(p.negtive());
            dx.x = -dx.x;
            dx.y = -dx.y;

            dx = dx.add(mapData.touchStartMapPos);



            mapData.mapPos.set_p(dx);
        }
    }
}

//鼠标移动到锚点上缩放
function anchorUpdate(p) {
    //console.log("hi");
    if (insideCanvas(p)) {
        p = convertInCanvas(p);
        var e = sprites.get("game_map");
        var p3 = new Vec2();
        p3.set(190 / 2, 210 / 2);
        for (var i = 1; i <= 199; ++i) {
            var anc = anchors[i];

            var p0 = new Vec2();
            p0.set(200, 220);
            var sc = Math.max(e.scale, 0.2);

            p0 = p0.plus_n(sc);

            var p1 = anc.orgPos.plus_n(e.scale).add(e.pos).add(p3.plus_n(sc).negtive());
            //console.log(anc.pos);
            if (inside(p, p1, p0.x, p0.y)) {
                anc.mouseon = true;
                //anc.z_order = 10;
            } else {
                anc.mouseon = false;
                //anc.z_order = 0;
            }
        }
    }
}

function draw() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    ctx.fillRect(0, 0, 1200, 700);

    var arr = Array.from(sprites);
    arr.sort((a, b) => a.z_order < b.z_order);
    for (var i = 0; i < arr.length; ++i) {
        //console.log(i);
        arr[i][1].visit(ctx, 700);
    }
}

