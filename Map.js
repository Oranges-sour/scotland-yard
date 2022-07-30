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
        this.head[u] = ++this.cnt;
        this.ee[this.cnt] = e;
    }
}



class GameMap {
    constructor() {

    }
}


export default GameMap;
