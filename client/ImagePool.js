class ImagePool {
    constructor() {
        this.map = new Map();
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