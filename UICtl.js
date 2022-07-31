import { chessSelect, chessStepOn, sprites_ui, thiefStepList, cardsLeft } from "./idx.js";
import Sprite from "./Sprite.js";

export function initUI() {
    var bk = new Sprite("src/play_ui.png");
    sprites_ui.set("play_ui", bk);

    var stepOn = new Sprite("src/arrow.png");
    stepOn.pos.y = 84;
    sprites_ui.set("step_on", stepOn);

    var selectOn = new Sprite("src/arrow.png");
    selectOn.pos.y = 174;
    sprites_ui.set("select_on", selectOn);
}

var chessSelectPos = [0, 52, 108, 162, 221, 275];
var chessStepOnPos = [0, 52, 126, 196, 272, 310];

//小偷行动的步骤
var thiefStepList_old = new Array();
for (var i = 1; i <= 24; ++i) {
    thiefStepList_old[i] = 0;
}

export function uiUpdate() {
    var e = sprites_ui.get("step_on");
    e.pos.x = chessStepOnPos[chessStepOn];

    var e = sprites_ui.get("select_on");
    e.pos.x = chessSelectPos[chessSelect];

    for (var i = 0; i <= 23; ++i) {
        var j = i + 1;
        if (thiefStepList_old[j] != thiefStepList[j] && thiefStepList[j] != 0) {

            var e = new Sprite("src/card_" + thiefStepList[j] + ".png");

            var kx = parseInt(i / 8);
            var ky = parseInt(i % 8);

            var x = kx * 73 + 80;
            var y = ky * 42 + 320;

            e.pos.set(x, y);

            sprites_ui.set("thief_card_" + j, e);
        }
    }
}

export function updateUIOnMouseUp(p) {

}

//选哪个棋子去下棋
function playChessSelect(x) {

}