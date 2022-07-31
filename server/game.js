//玩家的可能开始点
const playerStart = [141, 197, 174, 155, 198, 138, 132, 103, 117, 112, 94, 29, 34, 26, 13, 50, 53, 91];
//开始点是否被使用
var playerStartUsed = new Array();


var playerAt = new Array();
for (var i = 1; i <= 6; ++i) {
    playerAt[i] = i;
}

var chessStepOn = 1;

var thiefStepList = new Array();
for (var i = 1; i <= 24; ++i) {
    thiefStepList[i] = 0;
}

var cardsLeft = new Array();
for (var i = 1; i <= 5; ++i) {
    cardsLeft[i] = new Array();
    for (var j = 1; j <= 5; ++j) {
        cardsLeft[i][j] = 0;
    }
}

function initGame() {
    for (var i = 0; i < playerStart.length; ++i) {
        playerStartUsed[i] = false;
    }

    //初始化棋子坐标
    for (var i = 1; i <= 6; ++i) {
        var p = -1;
        while (true) {
            var k = getRandomNum(0, playerStart.length - 1);
            if (!playerStartUsed[k]) {
                playerStartUsed[k] = true;
                p = k;
                break;
            }
        }
        playerAt[i] = playerStart[p];
    }

    chessStepOn = 1;

    for (var i = 1; i <= 24; ++i) {
        thiefStepList[i] = 0;
    }

    
}

function getRandomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}