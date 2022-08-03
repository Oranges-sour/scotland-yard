import { web } from "./Web.js";

class Game {
    constructor() {
        this.init();
    }

    init() {
        this.gameData = new Object();
        //游戏局
        this.gameData.gameRound = 1;
        //当前选择了哪个卡
        this.gameData.cardSelect = 1;
        //到谁下棋
        this.gameData.chessStepOn = 1;
        //小偷行动的步骤
        this.gameData.thiefStepList = new Array();
        for (var i = 1; i <= 24; ++i) {
            this.gameData.thiefStepList[i] = 1;
        }
        //玩家能控制的棋
        this.gameData.selfChessCtl = [1, 2, 3, 4, 5, 6];
        //剩余的卡牌
        this.gameData.cardsLeft = new Array();
        for (var i = 1; i <= 6; ++i) {
            this.gameData.cardsLeft[i] = new Array();
            for (var j = 1; j <= 5; ++j) {
                this.gameData.cardsLeft[i][j] = 0;
            }
        }
        this.gameData.playerAt = new Array();
        for (var i = 1; i <= 6; ++i) {
            this.gameData.playerAt[i] = i;
        }
        this.gameData.gameStart = false;

        //游戏胜利，0:还在继续，1：警察赢，2：小偷赢
        this.gameData.gameWin = 0;
    }

    isGameStart() {
        return this.gameData.gameStart;
    }

    setCardSelect(x) {
        this.gameData.cardSelect = x;
    }

    setSelfChessCtl(ctl) {
        this.gameData.selfChessCtl = ctl;
    }

    resetGame() {
        this.gameData.gameStart = false;
        this.gameData.gameWin = 0;
    }

    startGame() {
        this.gameData.gameStart = true;
        this.gameData.gameWin = 0;
    }

    setGameStart(x) {
        this.gameData.gameStart = x;
    }

    gamePoliceWin() {
        this.gameData.gameStart = false;
        this.gameData.gameWin = 1;
    }

    gameThiefWin() {
        this.gameData.gameStart = false;
        this.gameData.gameWin = 2;
    }

    updateGameStatue(obj) {
        this.gameData.cardsLeft = obj.cardsLeft;
        this.gameData.thiefStepList = obj.thiefStepList;
        this.gameData.chessStepOn = obj.chessStepOn;
        this.gameData.playerAt = obj.playerAt;
        this.gameData.gameRound = obj.gameRound;
    }

    playChess(where) {
        //检查现在是不是到自己操控的棋子
        var k = -1;
        for (var i = 0; i < this.gameData.selfChessCtl.length; ++i) {
            if (this.gameData.chessStepOn == this.gameData.selfChessCtl[i]) {
                k = this.gameData.chessStepOn;
            }
        }
        //不到自己
        if (k == -1) {
            return;
        }


        //到自己，发送下棋消息
        web.playChess(where, this.gameData.cardSelect);
    }

}

var game = new Game();

export var game;