class ImagePool {
    constructor() {
        this.map = new Map();
    }

    load(src, func) {
        if (this.map.has(src)) {
            return;
        }


        var img = new Image();

        var that = this;
        img.onload = function () {
            that.map.set(src, img);
            func(src);
        }
        img.src = src;
    }

    get(src) {
        if (this.map.has(src)) {
            return this.map.get(src);
        }

        var img = new Image();
        img.src = src;
        this.map.set(src, img);

        return img;
    }

    map
}

var imgPool = new ImagePool();

export var imgPool;