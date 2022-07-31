import { edgeData } from "./EdgeData.js";

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