import { gameRound, thiefStepList, playerAt, cardsLeft, gameMap } from "./game.js";
import Queue from "./Queue.js";
import { edgeData } from "./EdgeData.js"
import { Graph } from "./GameMap.js";

//小偷可能在的位置
var thiefPossible = new Set();

//小偷第一次显形时候的位置
var thiefFirstShowP = 0;

class Graph1 {
}
Graph1.prototype = new Graph;
Graph1.addE = function (u, v, type) {
    var e = new Object();
    e.u = u;
    e.v = v;
    e.type = type;
    e.nxt = this.head[u];
    this.cnt += 1;
    this.head[u] = this.cnt;
    this.ee[this.cnt] = e;
}

var wholeMap = new Graph1();


function aiInit() {
    for (var i = 1; i <= 199; ++i) {
        var t = new Array();
        t[0] = edgeData[i].taxi;
        t[1] = edgeData[i].bus;
        t[2] = edgeData[i].subway;
        for (var j = 0; j <= 2; ++j) {
            for (var k = 0; k < t[j].length; ++k) {
                wholeMap.addE(i, t[j][k], j + 1);
            }
        }
    }
}

//保证要在这一轮的小偷走完后调用
function aiUpdate() {
    if (gameRound == 3) {
        thiefFirstShowP = playerAt[1];
    }

    thiefPossible.clear();
    thiefPossible.set(thiefFirstShowP);

    calcuThiefPossible();
}

//要在update之后调用
function playChess(who) {

}

//没有优先队列懒得自己写，用普通队列代替计算最短路了
function play_calcu(start, end) {
    var que = new Queue();
    while (!que.empty()) {
        var q = que.front();

    }
}



//从头开始推至当前，算出小偷可能在的位置
function calcuThiefPossible() {
    for (var i = 3; i <= gameRound; ++i) {
        var a = calcuStep(i);
        thiefPossible = a;
    }

}

function calcuStep(step) {
    var ans = new Set();

    var type = thiefStepList[step];
    if (type <= 3) {
        var g = gameMap[type];
        thiefPossible.forEach(function (v) {

            var a = calcu_bfs(g, v, 1);
            a.forEach(function (e) {
                ans.set(e);
            });

        });
    }
    //走两步
    if (type == 4) {
        //四种路线都可能
        for (var i = 1; i <= 4; ++i) {
            var g = gameMap[i];
            thiefPossible.forEach(function (v) {
                //走两步
                var a = calcu_bfs(g, v, 2);
                a.forEach(function (e) {
                    ans.set(e);
                });
            });
        }
    }
    if (type == 5) {
        //四种路线都可能
        for (var i = 1; i <= 4; ++i) {
            var g = gameMap[i];
            thiefPossible.forEach(function (v) {
                //走1步
                var a = calcu_bfs(g, v, 1);
                a.forEach(function (e) {
                    ans.set(e);
                });
            });
        }
    }

    return ans;
}

function calcu_bfs(g, start, times) {
    var arr = new Set();

    obj.t = 0;
    obj.u = start;

    var que = new Queue();
    var obj = new Object();

    que.push(obj);

    while (!que.empty()) {
        var q = que.front();
        if (q.t > times) {
            break;
        }

        arr.set(q.u);

        for (var x = g.head[q.u]; x != -1; x = g.ee[x].nxt) {
            var vv = g.ee[x].v;

            var obj = new Object();
            obj.t = q.t + 1;
            obj.u = vv;

            que.push(obj);
        }
    }

    return arr;
}