import { Sprite } from "./Sprite.js";
import Vec2 from "./Vec2.js";


import { anchorData } from "./AnchorData.js";

import { sprites_main, anchors, convertInCanvas, insideCanvas, inside } from "./idx.js";


export class Anchor {
    constructor(type, number) {
        this.sp = new Sprite("src/anchor_" + type + ".png");

        this.number = number;
        this.outstr = "";
        if (this.number < 10) {
            this.outstr = "00" + this.number;
        } else if (this.number < 100) {
            this.outstr = "0" + this.number;
        } else {
            this.outstr = this.number;
        }


        this.pos = new Vec2();

        this.orgPos = new Vec2();
    }

    z_order = 0;

    scale = 1.0;

    mouseon = false;

    visit(canvas, height) {
        this.sp.pos.set_p(this.pos);
        this.sp.scale = this.scale;

        this.sp.visit(canvas, height);

        canvas.save();

        var x = this.pos.x;
        var y = this.pos.y;

        canvas.translate(x, y);

        canvas.scale(this.scale, this.scale);

        canvas.fillStyle = "rgb(10, 10, 10)";
        canvas.font = "80px Verdana";

        canvas.fillText(this.outstr, 20, 140);

        canvas.restore();

    }
}

export function anchorInit() {
    //创建节点
    for (var i = 1; i <= 199; ++i) {
        var sp1 = new Anchor(anchorData[i].type, i);

        sp1.orgPos.x = anchorData[i].x;
        sp1.orgPos.y = anchorData[i].y;

        sp1.scale = 0.3;

        sprites_main.set(i, sp1);

        anchors[i] = sp1;
    }
}

export function anchorUpdate(p) {
    if (insideCanvas(p)) {
        p = convertInCanvas(p);
        var e = sprites_main.get("game_map");
        var p3 = new Vec2();
        p3.set(190 / 2, 210 / 2);
        for (var i = 1; i <= 199; ++i) {
            var anc = anchors[i];

            var p0 = new Vec2();
            p0.set(200, 220);
            var sc = Math.max(e.scale, 0.2);

            p0 = p0.plus_n(sc);

            var p1 = anc.orgPos.plus_n(e.scale).add(e.pos).add(p3.plus_n(sc).negtive());
            //console.log(anc.pos);
            if (inside(p, p1, p0.x, p0.y)) {
                anc.mouseon = true;
            } else {
                anc.mouseon = false;
            }
        }
    }
}