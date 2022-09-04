import { Sprite } from "./webdraw/Sprite.js";
import { Label } from "./webdraw/Label.js";
import { Node } from "./webdraw/Node.js";
import { Vec2 } from "./webdraw/Vec2.js";
import { ImagePool } from "./webdraw/ImagePool.js";
import { Director, DirectorManager } from "./webdraw/Director.js";


import { anchorData } from "./AnchorData.js";

import { main_director, insideCanvas, convertInCanvas } from "./idx.js";

export class Anchor {
    constructor(type, number) {
        var str = "src/anchor_" + type + ".png";

        this.number = number;
        this.mouseon = false;

        var outstr = "";
        if (this.number < 10) {
            outstr = "00" + this.number;
        } else if (this.number < 100) {
            outstr = "0" + this.number;
        } else {
            outstr = this.number;
        }

        this.sp = Sprite.new(str);
        this.sp_num = Label.with_font_color(80, "Verdana", "rgb(10,10, 10)");
        this.sp_num.set_text(outstr);
        this.sp_num.set_position_with_pos(-80, 30);
        this.sp_num.set_z_order(1);
    }

    static new(type, number) {
        var anc = new Anchor(type, number);
        return anc;
    }
}

export function initAnchor() {
    //创建节点
    for (let i = 1; i <= 199; ++i) {
        let sp = Anchor.new(anchorData[i].type, i);

        let node = Node.new();
        node.add_child_with_key(sp.sp_num, "sp_num");
        node.add_child_with_key(sp.sp, "sp");
        node.set_anchor_with_pos(0.5, 0.5);
        node.set_size_with_other(sp.sp.get_size());


        node.set_position_with_pos(anchorData[i].x, anchorData[i].y);


        let scale_node = main_director.get_child_with_key("scale_node");
        let render_node = scale_node.get_child_with_key("render_node");

        render_node.add_child_with_key(node, `anchor_${i}`);
    }
}