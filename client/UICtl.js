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
    //用来移动显示用的节点
    let move_node = Node.new();
    ui_director.add_child_with_key(move_node, "move_node");

    let up_down = Sprite.new("src/play_ui_up_down.png");
    ui_director.add_child_with_key(up_down, "up_down");

    up_down.add_component_with_key(false, "tog");

    up_down.set_z_order(1);
    up_down.set_position_with_pos(20, 20);

    up_down.add_schedule(function () {
        let move_node = ui_director.get_child_with_key("move_node");

        let t = up_down.get_component_with_key("tog");

        if (t) {
            move_node.set_position_with_pos(0, -400);

            up_down.set_rotation(-Math.PI);
        } else {
            move_node.set_position_with_pos(0, 0);

            up_down.set_rotation(0);
        }

    }, 1 / 60);

    //移动节点内的元素

    let bk = Sprite.new("src/play_ui.png");
    bk.set_anchor_with_pos(0, 0);
    move_node.add_child_with_key(bk, "play_ui");

    let step_on = Sprite.new("src/arrow.png");
    step_on.set_anchor_with_pos(0, 0);
    step_on.set_position_with_pos(0, 84);
    move_node.add_child_with_key(step_on, "step_on");

    let upd_node = Node.new();
    move_node.add_child_with_key(upd_node, "upd_node");

    //更新卡片展示堆
    upd_node.add_schedule(function () {
        uiUpdate();
    }, 1 / 60);

    //初始化卡片数量显示
    let cards_num_show = Node.new();

    let deck_x = [0, 50, 105, 160, 220, 275];
    for (let i = 1; i <= 5; ++i) {
        let sp = Label.with_font_color(20, "Verdana", "rgb(255,255,255)");
        cards_num_show.add_child_with_key(sp, `num_${i}`);

        sp.add_component_with_key(i, "num");
        sp.set_position_with_pos(deck_x[i], 240);

        //更新数字
        sp.add_schedule(function () {
            let num = sp.get_component_with_key("num");
            let k = game.gameData.chessStepOn;
            let str;
            if (game.gameData.cardsLeft[k][num] < 10) {
                str = "0" + game.gameData.cardsLeft[k][num];
            } else {
                str = game.gameData.cardsLeft[k][num];
            }

            sp.set_text(str);
        }, 1 / 60);

    }

    move_node.add_child_with_key(cards_num_show, "cards_num");
}

let chessStepOnPos = [0, 40, 88, 135, 181, 230, 280];

//小偷行动的步骤
let thiefStepList_old = new Array();
for (let i = 1; i <= 24; ++i) {
    thiefStepList_old[i] = 0;
}

function uiUpdate() {
    let move_node = ui_director.get_child_with_key("move_node");

    let step_on = move_node.get_child_with_key("step_on");
    let p = step_on.get_position();
    p.x = chessStepOnPos[game.gameData.chessStepOn];
    step_on.set_position_with_other(p);

    for (let i = 0; i <= 23; ++i) {
        let j = i + 1;
        let str = `card_${j}`;

        if (thiefStepList_old[j] != game.gameData.thiefStepList[j] && game.gameData.thiefStepList[j] != 0) {
            thiefStepList_old[j] = game.gameData.thiefStepList[j];

            move_node.remove_child(str);

            let sp = Sprite.new("src/card_" + game.gameData.thiefStepList[j] + ".png");
            sp.set_z_order(1);

            let kx = parseInt(i / 8);
            let ky = parseInt(i % 8);

            let x = kx * 73 + 124;
            let y = ky * 42 + 320;

            sp.set_anchor_with_pos(0, 0);
            sp.set_position_with_pos(x, y);

            move_node.add_child_with_key(sp, str);
        }
        if (game.gameData.thiefStepList[j] == 0) {
            move_node.remove_child(str);
        }
    }
}

export function updateUIOnMouseUp(p) {
    if (insideUICanvas(p)) {
        let pos = convertInUICanvas(p);
        {
            let lrp = Vec2.with_pos(17, 310);
            if (inside(pos, lrp, 80, 80)) {
                mapLocateNowChessOn();
            }
        }


        let up_down = ui_director.get_child_with_key("up_down");
        let size = up_down.get_size();
        let pp = up_down.get_position();
        let lrp = Vec2.with_pos(pp.x - size.w / 2, pp.y - size.h / 2);

        if (inside(pos, lrp, size.w, size.h)) {
            let t = up_down.get_component_with_key("tog");
            up_down.add_component_with_key(!t, "tog");
        }
    }
}