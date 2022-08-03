import Vec2 from "./Vec2.js";
import { imgPool } from "./ImagePool.js"

class Sprite {
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

        // canvas.scale(1 / this.scale, 1 / this.scale);

        // canvas.translate(-x, -y);
    }
}

export default Sprite;