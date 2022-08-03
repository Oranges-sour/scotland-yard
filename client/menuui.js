import { web } from "./Web.js";
import { game } from "./Game.js";


document.getElementById("ok_btn").onclick = joinGame;

document.getElementById("reset_btn").onclick = resetGame;

document.getElementById("start_btn").onclick = startGame;

const ctl = [[], [1], [2, 3], [4, 5], [6]];

var isClose = false;

function upd() {
    if (isClose) {
        document.getElementById("reset_btn").style.visibility = "hidden";
        document.getElementById("start_btn").style.visibility = "hidden";
        return;
    }
    var val = document.getElementById("selectChess").value;
    if (val == 1) {
        document.getElementById("reset_btn").style.visibility = "visible";
        document.getElementById("start_btn").style.visibility = "visible";
        document.getElementById("ok_btn").style.visibility = "hidden";
    } else {
        document.getElementById("reset_btn").style.visibility = "hidden";
        document.getElementById("start_btn").style.visibility = "hidden";
        document.getElementById("ok_btn").style.visibility = "visible";
    }
}

setInterval(upd, 100);

export function resetUI() {
    isClose = false;
    document.getElementById("MenuShow").style.visibility = "visible";
}

function joinGame() {
    //从概率上讲不可能产生相同的名字
    var name = randomString(true, 10, 20);
    var val = document.getElementById("selectChess").value;

    var c = ctl[val];

    web.helloGame(name, c);

    closeWin();
}

function startGame() {
    joinGame();
    game.startGame();
    web.startGame();
}

function resetGame() {
    game.resetGame();
    web.resetGame();
}

function closeWin() {
    isClose = true;
    document.getElementById("MenuShow").style.visibility = "hidden";
    document.getElementById("reset_btn").style.visibility = "hidden";
    document.getElementById("start_btn").style.visibility = "hidden";
    document.getElementById("ok_btn").style.visibility = "hidden";
}


function randomString(randomLen, min, max) {
    var str = "",
        range = min,
        arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k',
            'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
            'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F',
            'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
            'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    // 随机产生
    if (randomLen) {
        range = Math.round(Math.random() * (max - min)) + min;
    }
    for (var i = 0; i < range; i++) {
        var pos = Math.round(Math.random() * (arr.length - 1));
        str += arr[pos];
    }
    return str;
}