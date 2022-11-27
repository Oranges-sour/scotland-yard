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

const CtlStatueSuccess = "<div class=\"StartPage_CtlStatueSuccess\"></div>";
const CtlStatueFailed = "<div class=\"StartPage_CtlStatueFailed\"></div>";

var lastPlayerCnt = 0;

var playerChooseStatue = new Array();
for (var i = 1; i <= 6; ++i) {
    playerChooseStatue[i] = false;
}

//恢复服务器连接时需要重置UI
var serverConnectedReset = false;

var ele_uuid = document.getElementById("Start_UUID");
var ele_ChessChoose = document.getElementById("StartPage_ChessChoose");
var ele_PlayerCntChoose = document.getElementById("StartPage_PlayerCntChoose");
var ele_playerStatue = new Array();
for (var i = 1; i <= 6; ++i) {
    ele_playerStatue[i] = document.getElementById("StartPage_PlS_" + i);
}
var ele_home_page = document.getElementById("HomePage");
var ele_help_page = document.getElementById("HelpPage");
var ele_start_page = document.getElementById("StartPage");

var ele_serverStatueShow = document.getElementById("WebStatueShow");

document.getElementById("StartPage_Btn_Reset").onclick = function () {
    resetGame();
};
document.getElementById("StartPage_Btn_Join").onclick = function () {
    joinGame();
};
document.getElementById("StartPage_Btn_Ouit").onclick = function () {
    quitGame();
};
document.getElementById("StartPage_Btn_Start").onclick = function () {
    startGame();
};
document.getElementById("HomePage_Btn_Start").onclick = function () {
    onMenuHomePageBtnStart();
};
document.getElementById("HomePage_Btn_Help").onclick = function () {
    onMenuHomePageBtnHelp();
};
document.getElementById("HomePage_Btn_Fullscreen").onclick = function () {
    onMenuHomePageBtnFullscreen();
};
document.getElementById("HelpPage_Btn_Close").onclick = function () {
    onMenuBackHomePage();
};
document.getElementById("StartPage_Ctn_Close").onclick = function () {
    onMenuBackHomePage();
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

    ele_home_page.style.left = doc_w / 2 - ele_home_page.offsetWidth / 2 + "px";
    ele_start_page.style.left = doc_w / 2 - ele_start_page.offsetWidth / 2 + "px";
    ele_help_page.style.left = doc_w / 2 - ele_help_page.offsetWidth / 2 + "px";
    ele_serverStatueShow.style.left = doc_w / 2 - ele_serverStatueShow.offsetWidth / 2 + "px";
    ///

    if (!web.isServerConnected()) {
        ele_home_page.style.visibility = "hidden";
        ele_start_page.style.visibility = "hidden";
        ele_help_page.style.visibility = "hidden";
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
    var a = ele_home_page.style.visibility;
    var b = ele_help_page.style.visibility;
    var c = ele_start_page.style.visibility;

    if (a == "hidden" && b == "hidden" && c == "hidden") {
        ele_home_page.style.visibility = "visible";
        ele_help_page.style.visibility = "hidden";
        ele_start_page.style.visibility = "hidden";
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
    ele_home_page.style.visibility = "hidden";
    ele_help_page.style.visibility = "hidden";
    ele_start_page.style.visibility = "hidden";
}

function onMenuHomePageBtnStart() {
    ele_home_page.style.visibility = "hidden";
    ele_start_page.style.visibility = "visible";
}

function onMenuHomePageBtnHelp() {
    ele_home_page.style.visibility = "hidden";
    ele_help_page.style.visibility = "visible";
}
function onMenuBackHomePage() {
    ele_home_page.style.visibility = "visible";
    ele_help_page.style.visibility = "hidden";
    ele_start_page.style.visibility = "hidden";
}

function onMenuHomePageBtnFullscreen() {
    document.documentElement.requestFullscreen();
    //document.body.style.zoom = 0.5;
}

