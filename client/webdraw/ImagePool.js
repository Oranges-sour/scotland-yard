var map = new Map();

var load_regist = new Map();

function add_load_regist(src, func) {
    if (load_regist.has(src)) {
        load_regist.get(src).push(func);
        return;
    }

    load_regist.set(src, new Array());
    load_regist.get(src).push(func);
}

export class ImagePool {

    static load(src, func) {
        if (map.has(src)) {
            return;
        }

        add_load_regist(src, func);

        var img = new Image();
        map.set(src, img);
        img.onload = function () {
            var arr = load_regist.get(src);
            arr.forEach(ele => {
                ele[1]();
            });
            load_regist.delete(src);
        }
        img.onerror = function () {
            console.log("Load image faild: \"" + src + "\"!");
        }
        img.src = src;
    }

    static get(src) {
        if (map.has(src)) {
            return map.get(src);
        }

        var img = new Image();
        img.onerror = function () {
            console.log("Load image faild: \"" + src + "\"!");
        }
        map.set(src, img);
        img.src = src;

        return map.get(src);
    }
}