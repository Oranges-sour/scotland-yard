import { Node } from "./Node.js";
import { Tools } from "./Tools.js";



export class DirectorManager {
    static new_director(canvas, frame_rate) {
        var direc = new Director();
        direc.init(canvas, frame_rate);

        return direc;
    }
}

export class Director {
    constructor() {
        this.base_node = Node.new();
        this.g_time0 = new Date().getTime();
    }

    init(canvas, frame_rate) {
        this.g_canvas = canvas;
        this.g_ctx = this.g_canvas.getContext("2d");
        this.g_time0 = new Date().getTime() / 1000;

        var that = this;
        setInterval(function () {
            that.update();
        }, parseInt(1000 / frame_rate));
    }

    update() {
        var time1 = new Date().getTime() / 1000;
        this.base_node.onupdate(time1 - this.g_time0);
        this.g_time0 = time1;

        this.g_ctx.fillRect(0, 0, this.g_canvas.offsetWidth, this.g_canvas.offsetHeight);
        this.base_node.visit(this.g_ctx);
    }

    add_child(child) {
        this.base_node.add_child_with_key(child, Tools.generate_random_string(32));
    }

    add_child_with_key(child, key) {
        this.base_node.add_child_with_key(child, key);
    }

    get_child_with_key(key) {
        return this.base_node.get_child_with_key(key);
    }

    remove_child(key) {
        this.base_node.remove_child(key);
    }
};