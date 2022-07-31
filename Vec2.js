class Vec2 {
    constructor() {
        this.x = 0;
        this.y = 0;
    }

    set(x, y) {
        this.x = x;
        this.y = y;
    }

    set_p(other) {
        this.x = other.x;
        this.y = other.y;
    }

    add(other) {
        var ans = new Vec2();
        ans.x = this.x + other.x;
        ans.y = this.y + other.y;
        return ans;
    }

    negtive() {
        var ans = new Vec2();
        ans.x = -this.x;
        ans.y = -this.y;
        return ans;
    }

    plus(other) {
        return this.x * other.x + this.y * other.y;
    }

    plus_n(k) {
        var ans = new Vec2();
        ans.x = this.x * k;
        ans.y = this.y * k;
        return ans;
    }

    normal() {
        var k = this.dist();
        if (k == 0) {
            return new Vec2();
        }
        var ans = new Vec2();
        ans.x = this.x;
        ans.y = this.y;
        return ans.plus_n(1.0 / k);
    }

    copy() {
        var ans = new Vec2();
        ans.x = this.x;
        ans.y = this.y;
        return ans;
    }

    dist() {
        //console.log(this.x);
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
}

export default Vec2;