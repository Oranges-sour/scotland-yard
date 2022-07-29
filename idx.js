'use strict'
import Sprite from "./Sprite.js"
import Vec2 from "./Vec2.js";
import Anchor from "./Anchor.js"

import { anchorData } from "./Anchor.js";

var sprites = new Map();

var anchors = new Array();

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

    mapData.scale = 0.3;

    mapData.mapPos.set(-2800, -2800);

    for (var i = 1; i <= 199; ++i) {
        var sp1 = new Anchor(anchorData[i].type, i);

        sp1.orgPos.x = anchorData[i].x - 190 / 2;
        sp1.orgPos.y = anchorData[i].y - 210 / 2;

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


    console.log("(" + ((x - mapData.mapPos.x) / mapData.scale) + ", " + ((y - mapData.mapPos.y) / mapData.scale) + ")")
}

function mousemove(x, y) {
    var p = new Vec2();
    p.set(x, y);
    dragMoveMapOnMove(p);

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

        var speed = calcuSpeed(dis, 3, 5);
        var dx = nowPos.add(dPos.normal().plus_n(speed));
        if (speed <= 0.003) {
            dx = nowPos.add(dPos);
        }

        e.pos.set_p(dx);


        // for (var i = 1; i <= 199; ++i) {
        //     anchors[i].pos.set_p(anchors[i].pos.add(dPos.normal().plus_n(speed)));
        // }

        //e.pos.set_p(mapData.mapPos);
    }

    //检查缩放
    {
        var centerPos = new Vec2();
        centerPos.set(600, 350);

        var deltaSc = mapData.scale - e.scale;
        var abs_deltaSc = Math.abs(deltaSc);

        if (abs_deltaSc >= 0.00001) {
            var sp = calcuSpeed(abs_deltaSc * 100, 3, 5) / 100;
            if (abs_deltaSc <= 0.003) {
                sp = abs_deltaSc;
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

        for (var i = 1; i <= 199; ++i) {
            var anc = anchors[i];

            // var p3 = new Vec2();
            // p3.set(0, 0);

            // p3 = p3.plus_n(-0.5);

            var p0 = anc.orgPos.plus_n(e.scale);

            var p1 = p0.add(e.pos);

            //var p1 = p0.plus_n(e.scale);
            anc.scale = e.scale;
            anc.pos.set_p(p1);
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

