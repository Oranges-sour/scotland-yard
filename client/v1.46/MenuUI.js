import { web, Web } from "./Web.js";
import { game, Game } from "./Game.js";
import { isDevicePC } from "./idx.js";

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

const CtlStatueSuccess = "<div class=\"CtlStatueSuccess\"></div>";
const CtlStatueFailed = "<div class=\"CtlStatueFailed\"></div>";

var lastPlayerCnt = 0;

var playerChooseStatue = new Array();
for (var i = 1; i <= 6; ++i) {
    playerChooseStatue[i] = false;
}

//恢复服务器连接时需要重置UI
var serverConnectedReset = false;

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

var ele_serverStatueShow = document.getElementById("WebStatueShow");

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
document.getElementById("Menu_Fullscreen").onclick = function () {
    onMenuFullscreen();
};
document.getElementById("Help_Close").onclick = function () {
    onMenuBack();
};
document.getElementById("Start_Close").onclick = function () {
    onMenuBack();
};

//按钮功能设置成功
export function btnCtlSuccess(obj) {
    if (obj.type1 == "reset") {
        setCtlStatue("BtnReset_S", true);
    }
    if (obj.type1 == "join") {
        var ctl = obj.append;
        game.setSelfChessCtl(ctl);

        setCtlStatue("BtnJoin_S", true);
    }
    if (obj.type1 == "quit") {
        setCtlStatue("BtnQuit_S", true);
    }
    if (obj.type1 == "start") {
        setCtlStatue("BtnStart_S", true);
    }
}

//按钮功能设置成功
export function btnCtlFailed(obj) {
    if (obj.type1 == "reset") {
        setCtlStatue("BtnReset_S", false);
    }
    if (obj.type1 == "join") {
        setCtlStatue("BtnJoin_S", false);
    }
    if (obj.type1 == "quit") {
        setCtlStatue("BtnQuit_S", false);
    }
    if (obj.type1 == "start") {
        setCtlStatue("BtnStart_S", false);
    }
}

function setCtlStatue(ele_str, isSuc) {
    var e = document.getElementById(ele_str);
    if (isSuc) {
        e.innerHTML = CtlStatueSuccess;
    } else {
        e.innerHTML = CtlStatueFailed;
    }


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
    let zoom = document.documentElement.style.zoom;
    let doc_w = document.documentElement.clientWidth / zoom;
    let doc_h = document.documentElement.clientHeight / zoom;

    ele_menu.style.left = doc_w / 2 - ele_menu.offsetWidth / 2 + "px";
    ele_start.style.left = doc_w / 2 - ele_start.offsetWidth / 2 + "px";
    ele_help.style.left = doc_w / 2 - ele_help.offsetWidth / 2 + "px";
    ele_serverStatueShow.style.left = doc_w / 2 - ele_serverStatueShow.offsetWidth / 2 + "px";
    ///

    if (!web.isServerConnected()) {
        ele_menu.style.visibility = "hidden";
        ele_start.style.visibility = "hidden";
        ele_help.style.visibility = "hidden";
        ele_serverStatueShow.style.visibility = "visible";


        serverConnectedReset = false;
    } else {
        //console.log(serverConnectedReset);
        if (!serverConnectedReset) {
            resetUI();
            serverConnectedReset = true;
        }
    }

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
}

setInterval(function () {
    menuUpd();
}, 100);

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
    ele_serverStatueShow.style.visibility = "hidden";
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

function onMenuFullscreen() {
    document.documentElement.requestFullscreen();
    //document.body.style.zoom = 0.5;
}
