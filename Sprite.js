import Vec2 from "./Vec2.js";

class Sprite {
    constructor(src) {
        this.img = new Image();
        this.img.src = src;
        var that = this;
        this.img.onload = function () {
            that.loadFinish = true;
        };

        this.pos = new Vec2();
    }

    z_order = 0;

    loadFinish = false;

    scale = 1.0;

    setScale(x) {
        this.scale = x;
    }

    visit(canvas, height) {
        if (this.loadFinish != true) {
            return;
        }

        var x = this.pos.x;
        var y = this.pos.y;

        canvas.translate(x, y);

        canvas.scale(this.scale, this.scale);

        canvas.drawImage(this.img, 0, 0);

        canvas.scale(1 / this.scale, 1 / this.scale);

        canvas.translate(-x, -y);
    }
}

export default Sprite;