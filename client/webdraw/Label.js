'use strict';
import { Node } from "./Node.js";

export class Label extends Node {
    constructor(font_size, font_family, font_color) {
        super();

        this.font_size = font_size;
        this.font_family = font_family;
        this.font_color = font_color;
        this.text = new String();
    }

    static new() {
        return new Label(12, "Arial", "#ffffff");
    }

    static with_font(font_size, font_family) {
        return new Label(font_size, font_family, "#ffffff");
    }

    static with_font_color(font_size, font_family, font_color) {
        return new Label(font_size, font_family, font_color);
    }

    get_text() {
        return new String(this.text);
    }

    set_text(text) {
        this.text = text;
    }

    get_font_size() {
        return this.font_size;
    }

    set_font_size(size) {
        this.font_size = size;
    }

    get_font_family() {
        return this.font_family;
    }

    set_font_family(font_family) {
        this.font_family = font_family;
    }

    get_font_color() {
        return this.font_color;
    }

    set_font_color(font_color) {
        this.font_color = font_color;
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
        var dx = 0;
        var dy = 0;
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

        //绘制文字
        ctx.font = `${this.font_size}px ${this.font_family}`;
        ctx.fillStyle = `${this.font_color}`;

        ctx.fillText(this.text, 0, 0);

        for (var i = p; i < arr.length; ++i) {
            var ch = arr[i][1];
            ch.visit(ctx);
        }

        ctx.restore();
    }

};