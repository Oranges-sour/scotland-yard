export class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static new() {
        return new Vec2(0, 0);
    }

    static with_pos(x, y) {
        return new Vec2(x, y);
    }

    static with_other(other) {
        return new Vec2(other.x, other.y);
    }

    static add(vec0, vec1) {
        return Vec2.with_pos(vec0.x + vec1.x, vec0.y + vec1.y);
    }

    static sub(vec0, vec1) {
        return Vec2.with_pos(vec0.x - vec1.x, vec0.y - vec1.y);
    }

    static scalar(vec0, num) {
        return Vec2.with_pos(vec0.x * num, vec0.y * num);
    }

    static dot(vec0, vec1) {
        return vec0.x * vec1.x + vec0.y * vec1.y;
    }

    static rotate_rad(vec0, a) {
        return Vec2.with_pos(
            vec0.x * Math.cos(a) - vec0.y * Math.sin(a),
            vec0.x * Math.sin(a) + vec0.y * Math.cos(a));
    }

    static normalize(vec0) {
        var d = vec0.dist();
        return Vec2.with_pos(vec0.x / d, vec0.y / d);
    }

    add_eq(vec1) {
        this.x += vec1.x;
        this.y += vec1.y;
    }

    sub_eq(vec1) {
        this.x -= vec1.x;
        this.y -= vec1.y;
    }

    scalar_eq(num) {
        this.x *= num;
        this.y *= num;
    }

    rotate_rad_eq(a) {
        this.x = this.x * Math.cos(a) - this.y * Math.sin(a);
        this.y = this.x * Math.sin(a) + this.y * Math.cos(a);
    }

    set_with_pos(x, y) {
        this.x = x;
        this.y = y;
    }

    set_with_other(other) {
        this.x = other.x;
        this.y = other.y;
    }

    normalize_eq() {
        var d = this.dist();
        this.x = this.x / d;
        this.y = this.y / d;
    }

    dist() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
}