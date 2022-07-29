'use strict'
import Sprite from "./Sprite.js"
import Vec2 from "./Vec2.js";

var sprites = new Map();

var mapData = new Object;
mapData.touchStartMapPos = new Vec2();
mapData.mapPos = new Vec2();
mapData.scale = 1.0;


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

function insideCanvas(pos) {
    var canvas = document.getElementById("canvas");

    var w = canvas.offsetWidth;
    var h = canvas.offsetHeight;
    var left = canvas.offsetLeft;
    var top = canvas.offsetTop;

    if (pos.x >= left && pos.x <= left + w && pos.y >= top && pos.y <= top + h) {
        return true;
    }

    return false;
}

function convertToCanvas(pos) {
    if (!insideCanvas(pos)) {
        return new Vec2();
    }

    var canvas = document.getElementById("canvas");

    var h = canvas.offsetHeight;
    var left = canvas.offsetLeft;
    var top = canvas.offsetTop;

    var dx = pos.x - left;
    var dy = pos.y - top;

    var ans = new Vec2();
    ans.set(dx, h - dy);
    return ans;
}


function init() {
    var sp = new Sprite("src/map1.jpg");

    sprites.set("game_map", sp);

    sp.scale = 0.2;
    mapData.mapPos.set(0, 0);

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

}

function mousewheel(k) {
    
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
    //mapData.mapPos.x = Math.min(mapData.mapPos.x, w / 2 + 25);
    //右侧
    //mapData.mapPos.x = Math.max(mapData.mapPos.x, -w / 2 + 1200 - 25);
    //上侧
    //mapData.mapPos.y = Math.max(mapData.mapPos.y, -h / 2 + 700 - 25);
    //下侧
    //mapData.mapPos.y = Math.min(mapData.mapPos.y, h / 2 + 25);

    //计算地图移动
    {
        var nowPos = e.pos.copy();
        var dPos = mapData.mapPos.add(nowPos.negtive());
        var dis = dPos.dist();

        var speed = calcuSpeed(dis, 3, 2);
        var dx = nowPos.add(dPos.normal().plus_n(speed));
        e.pos.set_p(dx);

        //e.pos.set_p(mapData.mapPos);
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

