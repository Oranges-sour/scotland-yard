class Queue {
    constructor() {
        this.head = 1;
        this.tail = 1;
        this.arr = new Array();
    }

    empty() {
        if (this.head == this.tail) {
            return true;
        }
        return false;
    }

    size() {
        return this.tail - this.head;
    }

    push(x) {
        this.tail += 1;
        arr[this.tail] = x;
    }

    pop() {
        this.head += 1;
    }

    front() {
        return arr[this.head];
    }
}

export default Queue;