'use strict';
import { Node } from "./Node.js";

export class DrawNode extends Node {
    constructor() {
        super();

        this.shape = new Array();
    }

    static new() {
        return new DrawNode();
    }

    clear_shape() {
        this.shape.clear();
    }

    add_rect(lrp, w, h, solid = false, color = "rgb(255,255,255)") {
        let obj = new Object();
        obj.type = "rect";
        obj.lrp = lrp;
        obj.w = w;
        obj.h = h;
        obj.solid = solid;
        obj.color = color;

        this.shape.push(obj);
    }

    add_circle(center, r, solid, color = "rgb(255,255,255)") {
        let obj = new Object();
        obj.type = "circle";
        obj.center = center;
        obj.r = r;
        obj.solid = solid;
        obj.color = color;

        this.shape.push(obj);
    }

    visit(ctx) {

        if (!this.get_visible()) {
            return;
        }

        var arr = Array.from(this.children);
        arr.sort(function (a, b) {
            return a[1].z_order - b[1].z_order;
        });

        var x = this.pos.x;
        var y = this.pos.y;
        ctx.save();
        ctx.globalAlpha = ctx.globalAlpha * this.opacity;
        var dx = this.size.w * this.anchor.x;
        var dy = this.size.h * this.anchor.y;

        ctx.translate(x, y);
        ctx.scale(this.scale, this.scale);
        ctx.rotate(this.rotation);

        var p = 0;
        for (var i = 0; i < arr.length; ++i) {
            var ch = arr[i][1];
            if (ch.z_order == 0) {
                p = i;
                break;
            }
            ch.visit(ctx);
        }

        ///
        this.shape.forEach(function (obj) {
            if (obj.type == "rect") {
                ctx.strokeStyle = obj.color;
                ctx.fillStyle = obj.color;

                if (obj.solid) {
                    ctx.fillRect(obj.lrp.x, obj.lrp.y, obj.w, obj.h);
                } else {
                    ctx.strokeRect(obj.lrp.x, obj.lrp.y, obj.w, obj.h);
                }
            }
            if (obj.type == "circle") {
                ctx.beginPath();
                ctx.strokeStyle = obj.color;
                ctx.fillStyle = obj.color;
                ctx.arc(obj.center.x, obj.center.y, obj.r, 0, 2 * Math.PI);
                ctx.closePath();


                if (obj.solid) {
                    ctx.fill();
                } else {
                    ctx.stroke();
                }
            }
        });
        ///

        for (var i = p; i < arr.length; ++i) {
            var ch = arr[i][1];
            ch.visit(ctx);
        }

        ctx.restore();
    }



}