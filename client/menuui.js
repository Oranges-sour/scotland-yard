import { helloGame, resetGame } from "./web.js";


document.getElementById("ok_btn").onclick = joinGame;

document.getElementById("reset_btn").onclick = rresetGame;

document.getElementById("close_btn").onclick = closeWin;

const ctl = [[], [1], [2, 3], [4, 5], [6]];

function joinGame() {
    var name = document.getElementById("nameinput").innerHTML;
    var val = document.getElementById("selectChess").value;

    console.log(val);

    var c = ctl[val];

    helloGame(name, c);
}

function rresetGame() {
    resetGame();
}

function closeWin() {
    document.getElementById("MenuShow").style.visibility = "hidden";
}