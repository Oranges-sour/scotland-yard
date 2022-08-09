import { web } from "./Web.js";
import { game } from "./Game.js";

const chessChooseInnerHtml = [
    "", "",
    //2
    "<option value=\"1\">小偷</option>" +
    "<option value=\"2\">红绿蓝黄紫</option>",
    //3
    "<option value=\"1\">小偷</option>" +
    "<option value=\"2\">红绿蓝</option>" +
    "<option value=\"3\">黄紫</option>",
    //4
    "<option value=\"1\">小偷</option>" +
    "<option value=\"2\">红绿</option>" +
    "<option value=\"3\">蓝黄</option>" +
    "<option value=\"4\">紫</option>",
    //5
    "<option value=\"1\">小偷</option>" +
    "<option value=\"2\">红绿</option>" +
    "<option value=\"3\">蓝</option>" +
    "<option value=\"4\">黄</option>" +
    "<option value=\"5\">紫</option>",
    //6
    "<option value=\"1\">小偷</option>" +
    "<option value=\"2\">红</option>" +
    "<option value=\"3\">绿</option>" +
    "<option value=\"4\">蓝</option>" +
    "<option value=\"5\">黄</option>" +
    "<option value=\"6\">紫</option>",
];


const chessCtl = [
    [], [],
    [[], [1], [2, 3, 4, 5, 6]],//2
    [[], [1], [2, 3, 4], [5, 6]],//3
    [[], [1], [2, 3], [4, 5], [6]],//4
    [[], [1], [2, 3], [4], [5], [6]],//5
    [[], [1], [2], [3], [4], [5], [6]]//6
];

const CtlStatue = "<div class=\"CtlStatue\"></div>"

var lastPlayerCnt = 0;

var playerChooseStatue = new Array();
for (var i = 1; i <= 6; ++i) {
    playerChooseStatue[i] = false;
}

var ele_uuid = document.getElementById("Start_UUID");
var ele_ChessChoose = document.getElementById("ChessChoose");
var ele_PlayerCntChoose = document.getElementById("PlayerCntChoose");
var ele_playerStatue = new Array();
for (var i = 1; i <= 6; ++i) {
    ele_playerStatue[i] = document.getElementById("PlS_" + i);
}
var ele_menu = document.getElementById("Menu");
var ele_help = document.getElementById("Help");
var ele_start = document.getElementById("Start");

var ele_flowCtl = document.getElementById("FlowCtl");

document.getElementById("BtnReset").onclick = function () {
    resetGame();
};
document.getElementById("BtnJoin").onclick = function () {
    joinGame();
};
document.getElementById("BtnQuit").onclick = function () {
    quitGame();
};
document.getElementById("BtnStart").onclick = function () {
    startGame();
};
document.getElementById("Menu_Start").onclick = function () {
    onMenuStart();
};
document.getElementById("Menu_Help").onclick = function () {
    onMenuHelp();
};
document.getElementById("Help_Close").onclick = function () {
    onMenuBack();
};
document.getElementById("Start_Close").onclick = function () {
    onMenuBack();
};


//浮动小窗，设置是否能拖动地图
//用来防止游戏开始后页面位置改变
//但在游戏状态下界面被禁止拖动的情况
var uiCanMoveMap = true;
document.getElementById("FlowCtl").onclick = function () {
    if (uiCanMoveMap) {
        uiCanMoveMap = false;
    } else {
        uiCanMoveMap = true;
    }
}

//是否可以拖动地图
export function uiCtlCanMoveMap() {
    return uiCanMoveMap;
}

//按钮功能设置成功
export function btnCtlSuccess(obj) {
    if (obj.type1 == "reset") {
        setCtlStatue("BtnReset_S");
    }
    if (obj.type1 == "join") {
        setCtlStatue("BtnJoin_S");
    }
    if (obj.type1 == "quit") {
        setCtlStatue("BtnQuit_S");
    }
}

function setCtlStatue(ele_str) {
    var e = document.getElementById(ele_str);
    e.innerHTML = CtlStatue;

    setTimeout(function () {
        clearCtlStatue(ele_str);
    }, 500);
}

function clearCtlStatue(ele_str) {
    var e = document.getElementById(ele_str);
    e.innerHTML = "";
}


function menuUpd() {
    //使界面始终在中央
    ele_menu.style.left = window.innerWidth / 2 - ele_menu.offsetWidth / 2 + "px";
    ele_start.style.left = window.innerWidth / 2 - ele_start.offsetWidth / 2 + "px";
    ele_help.style.left = window.innerWidth / 2 - ele_help.offsetWidth / 2 + "px";
    ///

    ele_uuid.innerHTML = "UUID: " + web.userName;

    var playerCnt = ele_PlayerCntChoose.value;
    if (playerCnt != lastPlayerCnt) {
        ele_ChessChoose.innerHTML = chessChooseInnerHtml[playerCnt];
        lastPlayerCnt = playerCnt;

        web.changePlayerCnt(playerCnt);
    }

    for (var i = 1; i <= 6; ++i) {
        if (playerChooseStatue[i]) {
            ele_playerStatue[i].style.backgroundImage = "url(\"src/ok.png\")";
        } else {
            ele_playerStatue[i].style.backgroundImage = "none";
        }
    }

    if (uiCanMoveMap) {
        ele_flowCtl.style.backgroundImage = "url(\"src/move_0.png\")";
    } else {
        ele_flowCtl.style.backgroundImage = "url(\"src/move_1.png\")";
    }
}

setInterval(function () {
    menuUpd();
}, 32);

//web更新当前的玩家选择状态
export function updateMenuStatue(obj) {
    playerChooseStatue = obj.playerChooseStatue;
    ele_PlayerCntChoose.value = obj.playerCnt;
}

//游戏重置时被调用
export function resetUI() {
    var a = ele_menu.style.visibility;
    var b = ele_help.style.visibility;
    var c = ele_start.style.visibility;

    if (a == "hidden" && b == "hidden" && c == "hidden") {
        ele_menu.style.visibility = "visible";
        ele_help.style.visibility = "hidden";
        ele_start.style.visibility = "hidden";
    }
}

function joinGame() {
    var playerCnt = ele_PlayerCntChoose.value;
    var chessChoose = ele_ChessChoose.value;

    var ctl = chessCtl[playerCnt][chessChoose];

    web.joinGame(ctl);
}

function startGame() {
    web.startGame();
}

function resetGame() {
    web.resetGame();
}

function quitGame() {
    game.setSelfChessCtl([]);
    web.quitGame();
}

export function closeUI() {
    ele_menu.style.visibility = "hidden";
    ele_help.style.visibility = "hidden";
    ele_start.style.visibility = "hidden";
    ele_flowCtl.style.visibility = "visible";
}

function onMenuStart() {
    ele_menu.style.visibility = "hidden";
    ele_start.style.visibility = "visible";
}

function onMenuHelp() {
    ele_menu.style.visibility = "hidden";
    ele_help.style.visibility = "visible";
}
function onMenuBack() {
    ele_menu.style.visibility = "visible";
    ele_help.style.visibility = "hidden";
    ele_start.style.visibility = "hidden";
}

