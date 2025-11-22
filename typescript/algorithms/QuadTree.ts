export interface IQuadTreeObject {
    rect: QuadTreeRect;
}

export class QuadTreeRect {
    public x: number;
    public y: number;
    public width: number;
    public height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    public contains(rect: QuadTreeRect): boolean {
        return (
            rect.x >= this.x &&
            rect.x + rect.width <= this.x + this.width &&
            rect.y >= this.y &&
            rect.y + rect.height <= this.y + this.height
        );
    }

    public coincidence(rect: QuadTreeRect) {
        let x1 = Math.max(this.x, rect.x);
        let y1 = Math.max(this.y, rect.y);
        let x2 = Math.min(this.x + this.width, rect.x + rect.width);
        let y2 = Math.min(this.y + this.height, rect.y + rect.height);
        let w = x2 - x1;
        let h = y2 - y1;
        return w > 0 && h > 0 ? w * h : -1;
    }
}

export default class QuadTree<T extends IQuadTreeObject> {
    public MAX_COUNT: number = 10;
    public MAX_DEPTH: number = 5;

    public rect: QuadTreeRect;
    public divided: boolean = false;
    public depth: number = 0;

    public children: QuadTree<T>[] = [];
    public objects: T[] = [];

    public constructor(rect: QuadTreeRect) {
        this.rect = rect;
    }

    public insert(obj: T): boolean {
        if (this.rect.coincidence(obj.rect) <= 0) return false;

        if (!this.divided && this.objects.length < this.MAX_COUNT) {
            this.objects.push(obj);
            return true;
        }

        if (this.depth >= this.MAX_DEPTH) {
            console.error(" ***** max depth and max count, check it ***** \n");
            return false;
        }

        if (!this.divided) {
            this.divide();
            this.divided = true;
        }

        for (let i = 0; i < this.children.length; i++) {
            let child = this.children[i];
            if (child.rect.contains(obj.rect)) return child.insert(obj);
        }

        this.objects.push(obj);
        return true;
    }

    public query(range: QuadTreeRect, res: T[]) {
        if (this.rect.coincidence(range) <= 0) return;

        for (let i = 0; i < this.objects.length; i++) {
            let object = this.objects[i];
            if (object.rect.coincidence(range) > 0) {
                res.push(object);
            }
        }

        if (this.divided) {
            for (let i = 0; i < this.children.length; i++) {
                let child = this.children[i];
                child.query(range, res);
            }
        }
    }

    public divide(): void {
        if (this.rect.width <= 1 || this.rect.height <= 1) return;
        let x = this.rect.x;
        let y = this.rect.y;
        let w = this.rect.width;
        let h = this.rect.height;

        let halfW = w / 2;
        let halfH = h / 2;

        this.children = [
            new QuadTree<T>(new QuadTreeRect(x, y, halfW, halfH)), // 左上
            new QuadTree<T>(new QuadTreeRect(x + halfW, y, halfW, halfH)), // 右上
            new QuadTree<T>(new QuadTreeRect(x, y + halfH, halfW, halfH)), // 左下
            new QuadTree<T>(new QuadTreeRect(x + halfW, y + halfH, halfW, halfH)), // 右下
        ];

        for (let i = 0; i < this.children.length; i++) this.children[i].depth = this.depth + 1;

        // 重新分配旧对象
        let oldObjects = this.objects;
        this.objects = [];
        for (let i = 0; i < oldObjects.length; i++) {
            let oldObject = oldObjects[i];
            let inserted = false;
            for (let j = 0; j < this.children.length; j++) {
                let child = this.children[j];
                if (child.rect.contains(oldObject.rect)) {
                    child.insert(oldObject);
                    inserted = true;
                    break;
                }
            }
            if (!inserted) this.objects.push(oldObject);
        }
    }

    public clear() {
        for (let i = 0; i < this.children.length; i++) {
            let child = this.children[i];
            child.clear();
        }
        this.children = [];
        this.objects = [];
        this.depth = 0;
        this.divided = false;
    }

    public destructor(): void {
        this.clear();
        this.children = null;
        this.objects = null;
    }
}
