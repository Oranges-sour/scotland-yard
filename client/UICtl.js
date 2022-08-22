import {
    sprites_ui, inside, insideUICanvas,
    convertInUICanvas
} from "./idx.js";
import { game } from "./Game.js";

import { Sprite } from "./Sprite.js";
import Vec2 from "./Vec2.js";

import { mapLocateNowChessOn } from "./GameMap.js";

export function initUI() {
    var bk = new Sprite("src/play_ui.png");
    sprites_ui.set("play_ui", bk);

    var stepOn = new Sprite("src/arrow.png");
    stepOn.pos.y = 84;
    sprites_ui.set("step_on", stepOn);
}

var chessStepOnPos = [0, 40, 88, 135, 181, 230, 280];

//小偷行动的步骤
var thiefStepList_old = new Array();
for (var i = 1; i <= 24; ++i) {
    thiefStepList_old[i] = 0;
}

export function uiUpdate() {
    var e = sprites_ui.get("step_on");
    e.pos.x = chessStepOnPos[game.gameData.chessStepOn];

    for (var i = 0; i <= 23; ++i) {
        var j = i + 1;
        if (thiefStepList_old[j] != game.gameData.thiefStepList[j] && game.gameData.thiefStepList[j] != 0) {

            var e = new Sprite("src/card_" + game.gameData.thiefStepList[j] + ".png");

            var kx = parseInt(i / 8);
            var ky = parseInt(i % 8);

            var x = kx * 73 + 124;
            var y = ky * 42 + 320;

            e.pos.set(x, y);

            sprites_ui.set("thief_card_" + j, e);
        }
        if (game.gameData.thiefStepList[j] == 0) {
            sprites_ui.delete("thief_card_" + j);
        }
    }
}

export function updateUIOnMouseUp(p) {
    if (insideUICanvas(p)) {
        var pos = convertInUICanvas(p);

        var lrp = new Vec2();
        lrp.set(17, 310);
        if (inside(pos, lrp, 80, 80)) {
            mapLocateNowChessOn();
        }
    }
}