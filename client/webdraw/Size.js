'use strict';
export class Size {
    constructor(w, h) {
        this.w = w;
        this.h = h;
    }

    static new() {
        return new Size(0, 0);
    }

    static with_size(w, h) {
        return new Size(w, h);
    }

    static with_other(other) {
        return Size.with_size(other.w, other.h);
    }

    static scalar(size, x) {
        return Size.with_size(size.w * x, size.h * x);
    }

    scalar_eq(x) {
        this.w *= x;
        this.h *= x;
    }

    set_with_other(other) {
        this.w = other.w;
        this.h = other.h;
    }

    set_with_size(w, h) {
        this.w = w;
        this.h = h;
    }
}