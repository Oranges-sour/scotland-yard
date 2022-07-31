import { edgeData } from "./EdgeData.js";
import Vec2 from "./Vec2.js";
import Sprite from "./Sprite.js";
import { sprites_main, anchors, mouseDown, touchStartPos, gameMap, players, insideCanvas } from "./idx.js";

var mapData = new Object;
mapData.touchStartMapPos = new Vec2();
mapData.mapPos = new Vec2();
mapData.scale = 1.0;

//链式前向星存图
class Graph {
    constructor(nodeCnt) {
        this.cnt = 0;
        this.head = new Array();
        for (var i = 0; i <= nodeCnt; ++i) {
            this.head[i] = -1;
        }
        this.ee = new Array();
    }

    addE(u, v) {
        var e = new Object();
        e.u = u;
        e.v = v;
        e.nxt = this.head[u];
        this.cnt += 1;
        this.head[u] = this.cnt;
        this.ee[this.cnt] = e;
    }
}



export class GameMap {
    constructor() {
        this.playerAt = new Array();
        this.playerAt[1] = 1;
        this.playerAt[2] = 2;
        this.playerAt[3] = 3;
        this.playerAt[4] = 4;
        this.playerAt[5] = 5;
        this.playerAt[6] = 6;


        //建四层图，分别是taxi，bus，subway，ship
        this.w = new Array();
        this.w[1] = new Graph(199);
        this.w[2] = new Graph(199);
        this.w[3] = new Graph(199);
        this.w[4] = new Graph(199);

        for (var i = 1; i <= 199; ++i) {
            var t = edgeData[i].taxi;
            var s = t.length;
            for (var j = 0; j < s; ++j) {
                this.w[1].addE(i, t[j]);
            }
        }

        for (var i = 1; i <= 199; ++i) {
            var t = edgeData[i].bus;
            var s = t.length;
            for (var j = 0; j < s; ++j) {
                this.w[2].addE(i, t[j]);
            }
        }

        for (var i = 1; i <= 199; ++i) {
            var t = edgeData[i].subway;
            var s = t.length;
            for (var j = 0; j < s; ++j) {
                this.w[3].addE(i, t[j]);
            }
        }

        for (var i = 1; i <= 199; ++i) {
            var t = edgeData[i].ship;
            var s = t.length;
            for (var j = 0; j < s; ++j) {
                this.w[4].addE(i, t[j]);
            }
        }
    }

    cango(type, u, v) {
        var ww = this.w[type];

        for (var x = ww.head[u]; x != -1; x = ww.ee[x].nxt) {
            var vv = ww.ee[x].v;
            if (vv == v) {
                return true;
            }
        }

        return false;
    }

    allcango(type, u) {

        var ww = this.w[type];

        var arr = new Set();
        var cnt = 0;

        for (var x = ww.head[u]; x != -1; x = ww.ee[x].nxt, ++cnt) {
            var vv = ww.ee[x].v;
            arr.add(vv);
        }

        return arr
    }
}

export function mapInit() {
    var sp = new Sprite("src/map1.jpg");
    sprites_main.set("game_map", sp);
    mapData.mapPos.set(-2800, -2800);
}

export function mapUpdateOnWheel(x, y, k) {
    const CS = 0.05;

    var p = new Vec2();
    p.set(x, y);
    if (insideCanvas(p)) {
        mapData.scale += CS * k;

        mapData.scale = Math.max(0.1, mapData.scale);
        mapData.scale = Math.min(2, mapData.scale);
    }
}

export function mapUpdateOnMouseDown(x, y) {
    mapData.touchStartMapPos.set_p(mapData.mapPos);
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
                if (gameMap.playerAt[j] == i) {
                    //console.log(players[j].pos);
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
}

export function dragMoveMapOnMove(p) {
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
