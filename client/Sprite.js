import Vec2 from "./Vec2.js";
import { imgPool } from "./ImagePool.js"

export class Sprite {
    constructor(src) {
        this.img = imgPool.get(src);
        this.pos = new Vec2();
    }

    z_order = 0;

    loadFinish = true;

    scale = 1.0;

    orgscale = 1.0;

    visible = true;

    setScale(x) {
        this.scale = x;
    }

    width() {
        return this.img.width * this.scale * this.orgscale;
    }

    height() {
        return this.img.height * this.scale * this.orgscale;
    }

    visit(canvas) {
        if (!this.visible) {
            return;
        }
        if (this.loadFinish != true) {
            return;
        }

        var x = this.pos.x;
        var y = this.pos.y;

        canvas.save();

        canvas.translate(x, y);

        canvas.scale(this.scale * this.orgscale, this.scale * this.orgscale);

        canvas.drawImage(this.img, 0, 0);

        canvas.restore();
    }
}

export class SpriteRect {
    constructor(x, y, w, h) {
        this.pos = new Vec2();
        this.pos.x = x;
        this.pos.y = y;

        this.w = w;
        this.h = h;
    }

    z_order = 0;

    scale = 1.0;

    orgscale = 1.0;

    visible = true;

    rgba = "rgba(0, 0, 0, 1.0)";

    setScale(x) {
        this.scale = x;
    }

    setRGBA(rgba) {
        this.rgba = rgba;
    }

    width() {
        return this.w * this.scale * this.orgscale;
    }

    height() {
        return this.h * this.scale * this.orgscale;
    }

    visit(canvas) {
        if (!this.visible) {
            return;
        }

        var x = this.pos.x;
        var y = this.pos.y;

        canvas.save();

        canvas.translate(x, y);

        canvas.scale(this.scale * this.orgscale, this.scale * this.orgscale);

        canvas.fillStyle = this.rgba;
        canvas.fillRect(0, 0, this.w, this.h);

        canvas.restore();
    }

}