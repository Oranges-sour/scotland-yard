import Vec2 from "./Vec2.js";
import Sprite from "./Sprite.js";
import { sprites_main, anchors, mouseDown, touchStartPos, players, insideCanvas } from "./idx.js";
import { imgPool } from "./ImagePool.js"
import { game } from "./Game.js";

var mapSpriteData = new Object;
mapSpriteData.touchStartMapPos = new Vec2();
mapSpriteData.mapPos = new Vec2();
mapSpriteData.scale = 1.0;

export function mapInit() {
    var sp = new Sprite("src/map_0.jpg");
    sprites_main.set("game_map", sp);
    sp.orgscale = 10;
    mapSpriteData.mapPos.set(-2800, -2800);

    //异步加载高分辨率的大地图
    imgPool.load("src/map.bmp", function (src) {
        var m = sprites_main.get("game_map");
        m.img = imgPool.get(src);
        sp.orgscale = 2.5;
    });
}

export function mapUpdateOnWheel(x, y, k) {
    if (!game.isGameStart()) {
        return;
    }
    const CS = 0.05;

    var p = new Vec2();
    p.set(x, y);
    if (insideCanvas(p)) {
        mapSpriteData.scale += CS * k;

        mapSpriteData.scale = Math.max(0.1, mapSpriteData.scale);
        mapSpriteData.scale = Math.min(2, mapSpriteData.scale);
    }
}

export function mapUpdateOnMouseDown(x, y) {
    if (!game.isGameStart()) {
        return;
    }
    mapSpriteData.touchStartMapPos.set_p(mapSpriteData.mapPos);
}

export function mapDataUpdate() {
    var e = sprites_main.get("game_map");

    function calcuSpeed(x, a, b) {
        return (x * x) / (b * (x + a));
    }

    //检查拖动
    var w = e.width();
    var h = e.height();
    //左侧
    mapSpriteData.mapPos.x = Math.min(mapSpriteData.mapPos.x, 600);
    //右侧
    mapSpriteData.mapPos.x = Math.max(mapSpriteData.mapPos.x, -w + 600);
    //上侧
    mapSpriteData.mapPos.y = Math.min(mapSpriteData.mapPos.y, 350);
    //下侧
    mapSpriteData.mapPos.y = Math.max(mapSpriteData.mapPos.y, -h + 350);

    //计算地图移动
    {
        var nowPos = e.pos.copy();
        var dPos = mapSpriteData.mapPos.add(nowPos.negtive());
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

        var deltaSc = mapSpriteData.scale - e.scale;
        var abs_deltaSc = Math.abs(deltaSc);

        if (abs_deltaSc >= 0.00001) {
            var sp = calcuSpeed(abs_deltaSc * 100, 3, 5) / 100;
            if (abs_deltaSc <= 0.005) {
                mapSpriteData.scale = e.scale;
            }

            var flag = deltaSc / abs_deltaSc;
            var tar = e.scale + flag * sp;

            var p0 = centerPos.add(mapSpriteData.mapPos.negtive());

            var p1 = p0.plus_n(1 / e.scale);
            e.scale = tar;
            var p2 = p1.plus_n(tar);

            var deltaP = p0.add(p2.negtive());

            mapSpriteData.mapPos = mapSpriteData.mapPos.add(deltaP);
            e.pos.set_p(mapSpriteData.mapPos);
        }

        //设置锚点坐标
        var p0 = new Vec2();
        p0.set(190 / 2, 210 / 2);
        for (var i = 1; i <= 199; ++i) {
            var anc = anchors[i];

            p0.set(190 / 2, 210 / 2);

            if (!anc.mouseon) {
                anc.scale = Math.max(e.scale, 0.2);
                anc.z_order = 0;
            } else {
                anc.scale = Math.max(e.scale + 0.1, 0.3);
                anc.z_order = 1;
            }

            p0 = p0.plus_n(-1 * anc.scale);
            var p1 = anc.orgPos.plus_n(e.scale);
            var p2 = p1.add(e.pos).add(p0);
            anc.pos.set_p(p2);
        }

        //设置玩家位置
        for (var i = 1; i <= 6; ++i) {
            var k = game.gameData.playerAt[i];

            var anc = anchors[k];

            var p1 = new Vec2();
            p1.set_p(anc.pos);
            p1.x += 10 * anc.scale;
            p1.y -= 150 * anc.scale;
            players[i].pos.set_p(p1);
            players[i].scale = anc.scale + 1.2 * anc.scale;
        }
    }

    //小偷是否显示
    if (((game.gameData.gameRound == 3 || game.gameData.gameRound == 8 ||
        game.gameData.gameRound == 13 || game.gameData.gameRound == 18 ||
        game.gameData.gameRound == 24) && game.gameData.chessStepOn >= 2)
        || game.gameData.selfChessCtl.includes(1)) {
        players[1].visible = true;
    } else {
        players[1].visible = false;
    }
}

export function dragMoveMapOnMove(p) {
    if (!game.isGameStart()) {
        return;
    }
    if (mouseDown) {
        if (insideCanvas(p)) {
            var dx = touchStartPos.add(p.negtive());
            dx.x = -dx.x;
            dx.y = -dx.y;

            dx = dx.add(mapSpriteData.touchStartMapPos);

            mapSpriteData.mapPos.set_p(dx);
        }
    }
}

//地图定位现在的棋子
export function mapLocateNowChessOn() {
    function locate() {
        var p0 = mapSpriteData.mapPos.copy();
        var p1 = players[game.gameData.chessStepOn].pos.copy();

        var p2 = p0.add(p1.negtive());
        p2.x += 600;
        p2.y += 350;
        mapSpriteData.mapPos.set_p(p2);
    }
    //控制的是小偷，那随意定位，如果不是小偷，则不能定位小偷
    if (game.gameData.selfChessCtl.includes(1)) {
        locate();
    } else {
        //现在不是1号（小偷）下棋，这样就不会定位到1号点
        if (game.gameData.chessStepOn != 1) {
            locate();
        }
    }
}
