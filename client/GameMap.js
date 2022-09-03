import { Sprite } from "./webdraw/Sprite.js";
import { Label } from "./webdraw/Label.js";
import { Node } from "./webdraw/Node.js";
import { Vec2 } from "./webdraw/Vec2.js";
import { Size } from "./webdraw/Size.js";
import { ImagePool } from "./webdraw/ImagePool.js";
import { Director, DirectorManager } from "./webdraw/Director.js";

import { game } from "./Game.js";

import { main_director, mouseDown, touchStartPos, insideCanvas, renderData } from "./idx.js";

var mapSpriteData = new Object;
mapSpriteData.touchStartMapPos = Vec2.new();
mapSpriteData.mapPos = Vec2.new();
mapSpriteData.scale = 1.0;

export function initMap() {
    var sp = Sprite.new("src/map.bmp");
    sp.set_scale(2.5);

    var move_node = main_director.get_child_with_key("move_node");
    var scale_node = move_node.get_child_with_key("scale_node");
    var render_node = scale_node.get_child_with_key("render_node");
    render_node.add_child_with_key(sp, "game_map");

    var upd_node = Node.new();
    main_director.add_child_with_key(upd_node, "upd_map");

    upd_node.add_schedule(function () {
        mapDataUpdate();
    }, 1 / 60.0, 0);
    //sp.orgscale = 10;
    // mapSpriteData.mapPos.set(-2800, -2800);

    //异步加载高分辨率的大地图
    // imgPool.load("src/map.bmp", function (src) {
    //     var m = sprites_main.get("game_map");
    //     m.img = imgPool.get(src);
    //     sp.orgscale = 2.5;
    // });
}

export function mapUpdateOnWheel(p, k) {
    if (!game.isGameStart()) {
        return;
    }
    const CS = 0.05;

    if (insideCanvas(p)) {
        mapSpriteData.scale += CS * k;

        mapSpriteData.scale = Math.max(0.1, mapSpriteData.scale);
        mapSpriteData.scale = Math.min(2, mapSpriteData.scale);
    }

    console.log(mapSpriteData.scale);
}

export function updateMapOnMouseDown(p) {
    if (!game.isGameStart()) {
        return;
    }
    mapSpriteData.touchStartMapPos.set_with_other(mapSpriteData.mapPos);
}

function mapDataUpdate() {
    var move_node = main_director.get_child_with_key("move_node");
    var scale_node = move_node.get_child_with_key("scale_node");
    var render_node = scale_node.get_child_with_key("render_node");

    var game_map = render_node.get_child_with_key("game_map");

    function calcuSpeed(x, a, b) {
        return (x * x) / (b * (x + a));
    }

    //检查拖动
    var size = Size.scalar(game_map.get_size(), game_map.get_scale());
    var w = size.w;
    var h = size.h;
    // //左侧
    // mapSpriteData.mapPos.x = Math.min(mapSpriteData.mapPos.x, renderData.width / 2);
    // //右侧
    // mapSpriteData.mapPos.x = Math.max(mapSpriteData.mapPos.x, -w + renderData.width / 2);
    // //上侧
    // mapSpriteData.mapPos.y = Math.min(mapSpriteData.mapPos.y, renderData.height / 2);
    // //下侧
    // mapSpriteData.mapPos.y = Math.max(mapSpriteData.mapPos.y, -h + renderData.height / 2);

    //计算地图移动
    {
        var nowPos = scale_node.get_position();
        var dPos = Vec2.sub(mapSpriteData.mapPos, nowPos);
        var dis = dPos.dist();

        var speed = calcuSpeed(dis, 3, 5);
        var dx = Vec2.add(nowPos, Vec2.scalar(Vec2.normalize(dPos), speed));
        if (speed <= 0.003) {
            dx.set_with_other(Vec2.add(nowPos, dPos));
        }

        scale_node.set_position_with_other(dx);
    }

    //检查缩放
    {

        var deltaSc = mapSpriteData.scale - scale_node.get_scale();
        var abs_deltaSc = Math.abs(deltaSc);

        if (abs_deltaSc >= 0.00001) {
            var sp = calcuSpeed(abs_deltaSc * 100, 3, 5) / 100;
            if (abs_deltaSc <= 0.005) {
                mapSpriteData.scale = scale_node.get_scale();
            }

            var flag = deltaSc / abs_deltaSc;
            var tar = scale_node.get_scale() + flag * sp;

            scale_node.set_scale(tar);
        }

        // //设置锚点坐标
        // var p0 = new Vec2();
        // //锚点的宽高
        // const aw = 190, ah = 210;
        // p0.set(aw / 2, ah / 2);
        // for (var i = 1; i <= 199; ++i) {
        //     var anc = anchors[i];

        //     p0.set(aw / 2, ah / 2);

        //     if (!anc.mouseon) {
        //         anc.scale = Math.max(e.scale, 0.2);
        //         anc.z_order = 0;
        //     } else {
        //         anc.scale = Math.max(e.scale + 0.1, 0.3);
        //         anc.z_order = 1;
        //     }

        //     p0 = p0.plus_n(-1 * anc.scale);
        //     var p1 = anc.orgPos.plus_n(e.scale);
        //     var p2 = p1.add(e.pos).add(p0);
        //     anc.pos.set_p(p2);
    }

    //     //设置玩家位置
    //     for (var i = 1; i <= 6; ++i) {
    //         var k = game.gameData.playerAt[i];

    //         var anc = anchors[k];

    //         var p1 = new Vec2();
    //         p1.set_p(anc.pos);
    //         p1.x += -50 * anc.scale;
    //         p1.y += -200 * anc.scale;
    //         players[i].pos.set_p(p1);
    //         players[i].scale = anc.scale + 1.2 * anc.scale;
    //     }
    // }

    // //小偷显示的轮
    // const thiefShowRound = [3, 8, 13, 18, 24];

    // //小偷是否显示
    // if ((thiefShowRound.includes(game.gameData.gameRound) && game.gameData.chessStepOn >= 2)
    //     || game.gameData.selfChessCtl.includes(1)) {
    //     players[1].visible = true;
    // } else {
    //     players[1].visible = false;
    // }
}

export function dragMoveMapOnMove(p) {
    if (!game.isGameStart()) {
        return;
    }

    if (mouseDown) {
        if (insideCanvas(p)) {
            var dx = Vec2.sub(touchStartPos, p);
            dx.x = -dx.x;
            dx.y = -dx.y;

            dx.set_with_other(Vec2.scalar(dx, 1 / mapSpriteData.scale));

            dx.add_eq(mapSpriteData.touchStartMapPos);

           

            mapSpriteData.mapPos.set_with_other(dx);
        }
    }
}

//地图定位现在的棋子
export function mapLocateNowChessOn() {
    function locate() {
        var p0 = mapSpriteData.mapPos.copy();
        var p1 = players[game.gameData.chessStepOn].pos.copy();

        var p2 = p0.add(p1.negtive());
        p2.x += renderData.width / 2;
        p2.y += renderData.height / 2;
        mapSpriteData.mapPos.set_p(p2);
    }
    //控制的是小偷，那随意定位，如果不是小偷，则不能在小偷不显示的时候定位小偷
    if (game.gameData.selfChessCtl.includes(1)) {
        locate();
    } else {
        //现在不是1号（小偷）下棋,随意定位
        if (game.gameData.chessStepOn != 1) {
            locate();
        }
    }
}
