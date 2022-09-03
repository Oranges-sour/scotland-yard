import { Vec2 } from "./Vec2.js";
import { Size } from "./Size.js";
import { Tools } from "./Tools.js";

export class Node {

    constructor() {
        this.pos = Vec2.new();
        this.anchor = Vec2.with_pos(0.5, 0.5);
        this.scale = 1.0;
        this.size = Size.new();
        this.z_order = 0;
        this.visible = true;
        this.opacity = 1.0;
        this.rotation = 0.0;
        this.children = new Map();

        this.key = new String();
        this.parent = null;

        this.sche = new Map();
    }

    static new() {
        return new Node();
    }

    get_size() {
        return Size.with_other(this.size);
    }

    set_size_with_other(other) {
        this.size.set_with_other(other);
    }

    set_size_with_size(w, h) {
        this.size.set_with_size(w, h);
    }

    get_position() {
        return Vec2.with_other(this.pos);
    }

    set_position_with_pos(x, y) {
        this.pos.set_with_pos(x, y);
    }

    set_position_with_other(other) {
        this.pos.set_with_other(other);
    }

    get_anchor() {
        return Vec2.with_other(this.anchor);
    }

    set_anchor_with_pos(x, y) {
        this.anchor.set_with_pos(x, y);
    }

    set_anchor_with_other(other) {
        this.pos.set_with_other(other);
    }

    get_scale() {
        return this.scale;
    }

    set_scale(sc) {
        this.scale = sc;
    }

    get_z_order() {
        return this.z_order;
    }

    set_z_order(z_order) {
        this.z_order = z_order;
    }

    get_opacity() {
        return this.opacity;
    }

    set_opacity(opacity) {
        this.opacity = opacity;
    }

    get_visible() {
        return this.visible;
    }

    set_visible(visible) {
        this.visible = visible;
    }

    get_rotation() {
        return this.rotation;
    }

    set_rotation(rotation) {
        this.rotation = rotation;
    }

    add_child(child) {
        this.add_child_with_key(child, Tools.generate_random_string(32));
    }

    add_child_with_key(child, key) {
        if (child.parent != null) {
            return;
        }
        this.children.set(key, child);
        child.parent = this;
        child.key = key;
    }

    get_child_with_key(key) {
        if (this.children.has(key)) {
            return this.children.get(key);
        }
        return undefined;
    }

    remove_child(key) {
        if (!this.children.has(key)) {
            return;
        }
        var child = this.children.get(key);
        this.children.delete(key);
        child.key = "";
        child.parent = null;
    }

    remove_from_parent() {
        if (this.parent == null) {
            return;
        }
        this.parent.remove_child(this.key);
    }

    add_schedule(func, delta_time, first_delay_time = 0, schedule_times = 2147483648) {
        this.add_schedule_with_key(
            func, delta_time, Tools.generate_random_string(32),
            first_delay_time, schedule_times);
    }

    add_schedule_with_key(func, delta_time, key, first_delay_time = 0, schedule_times = 2147483648) {
        var ob = new Object();
        ob.func = func;
        ob.delta_time = delta_time;
        ob.delta1 = first_delay_time;
        ob.key = key;
        //因为有first_delay_time的存在，以及实现方式的原因，会导致多调用一次，因此使
        //schedule_times - 1来解决问题
        ob.schedule_times = schedule_times - 1;

        this.sche.set(key, ob);
    }

    update_schedule(time) {
        var need_delete = new Array();

        this.sche.forEach(function (ob) {

            if (ob.schedule_times <= 0) {
                need_delete.push(ob.key);
                return;
            }

            if (ob.delta1 >= time) {
                ob.delta1 -= time;
            } else if (ob.delta1 - time <= 0) {
                ob.func();
                ob.schedule_times -= 1;
                ob.delta1 = ob.delta_time - time + ob.delta1;
            }

        });

        var that = this;
        need_delete.forEach(function (key) {
            that.sche.delete(key);
        });
    }


    onupdate(time) {
        var arr = Array.from(this.children);
        arr.sort(function (a, b) {
            return a[1].z_order - b[1].z_order;
        });

        var p = 0;
        for (var i = 0; i < arr.length; ++i) {
            var ch = arr[i][1];
            if (ch.z_order == 0) {
                p = i;
                break;
            }
            ch.onupdate(time);
        }

        this.update_schedule(time);

        for (var i = p; i < arr.length; ++i) {
            var ch = arr[i][1];
            ch.onupdate(time);
        }
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
        ctx.scale(this.scale, this.scale);
        ctx.translate(x + dx, y + dy);
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

        for (var i = p; i < arr.length; ++i) {
            var ch = arr[i][1];
            ch.visit(ctx);
        }

        ctx.restore();
    }
}