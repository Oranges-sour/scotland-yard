import Vec2 from "./Vec2.js";
import Sprite from "./Sprite.js";
import { sprites_main, anchors, mouseDown, touchStartPos, players, insideCanvas, gameData } from "./idx.js";

var mapSpriteData = new Object;
mapSpriteData.touchStartMapPos = new Vec2();
mapSpriteData.mapPos = new Vec2();
mapSpriteData.scale = 1.0;

export function mapInit() {
    var sp = new Sprite("src/map1.jpg");
    sprites_main.set("game_map", sp);
    mapSpriteData.mapPos.set(-2800, -2800);
}

export function mapUpdateOnWheel(x, y, k) {
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
    mapSpriteData.touchStartMapPos.set_p(mapSpriteData.mapPos);
}

export function mapDataUpdate() {
    var e = sprites_main.get("game_map");

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

            for (var j = 1; j <= 6; ++j) {
                if (gameData.playerAt[j] == i) {
                    var p1 = new Vec2();
                    p1.set_p(anc.pos);
                    p1.x += 10 * anc.scale;
                    p1.y -= 150 * anc.scale;
                    players[j].pos.set_p(p1);
                    players[j].scale = anc.scale + 1.2 * anc.scale;
                }
            }
        }
    }

    //小偷是否显示
    if (gameData.gameRound == 3 || gameData.gameRound == 8 ||
        gameData.gameRound == 13 || gameData.gameRound == 18 ||
        gameData.gameRound == 24
        || gameData.selfChessCtl.includes(1)) {

        players[1].visible = true;
    } else {
        players[1].visible = false;
    }
}

export function dragMoveMapOnMove(p) {
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
