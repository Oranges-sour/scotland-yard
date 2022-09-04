import { Sprite } from "./webdraw/Sprite.js";
import { Label } from "./webdraw/Label.js";
import { Node } from "./webdraw/Node.js";
import { Vec2 } from "./webdraw/Vec2.js";
import { ImagePool } from "./webdraw/ImagePool.js";
import { Director, DirectorManager } from "./webdraw/Director.js";

import {
    main_director, ui_director, inside, insideUICanvas,
    convertInUICanvas
} from "./idx.js";

import { game } from "./Game.js";

import { mapLocateNowChessOn } from "./GameMap.js";

export function initUI() {
    var bk = Sprite.new("src/play_ui.png");
    bk.set_anchor_with_pos(0, 0);
    ui_director.add_child_with_key(bk, "play_ui");

    var stepOn = Sprite.new("src/arrow.png");
    stepOn.set_position_with_pos(0, 84);
    ui_director.add_child_with_key(bk, "step_on");

    var upd_node = Node.new();
    ui_director.add_child_with_key(upd_node, "upd_node");
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
    // if (insideUICanvas(p)) {
    //     var pos = convertInUICanvas(p);

    //     var lrp = new Vec2();
    //     lrp.set(17, 310);
    //     if (inside(pos, lrp, 80, 80)) {
    //         mapLocateNowChessOn();
    //     }
    // }
}