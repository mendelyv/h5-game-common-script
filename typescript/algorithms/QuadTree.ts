export interface IQuadTreeObject {
    rect: QuadTreeRect;
    hightlight(): void;
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
        let width = x2 - x1;
        let height = y2 - y1;
        if (width < 0 || height < 0) return -1;
        return width * height;
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
        if (this.objects.length < this.MAX_COUNT && !this.divided) {
            if (this.rect.coincidence(obj.rect) > 0) {
                this.objects.push(obj);
                return true;
            }
        }

        if (this.depth > this.MAX_DEPTH) {
            console.error(" ***** max depth and max count, check it ***** \n");
            return false;
        }

        if (!this.divided) {
            this.divide();
            this.divided = true;
        }

        let maxChild = null;
        let maxArea = 0;
        for (let i = 0; i < this.children.length; i++) {
            let child = this.children[i];
            let contains = child.rect.contains(obj.rect);
            if (contains) {
                return child.insert(obj);
            } else {
                let area = child.rect.coincidence(obj.rect);
                if (area > maxArea) {
                    maxChild = child;
                    maxArea = area;
                }
            }
        }
        if (null != maxChild) {
            return maxChild.insert(obj);
        }

        return false;
    }

    public query(range: QuadTreeRect, res: T[]) {
        if (!this.rect.contains(range)) return;

        if (this.objects.length > 0) {
            for (let i = 0; i < this.objects.length; i++) {
                let obj = this.objects[i];
                res.push(obj);
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
        let x = this.rect.x;
        let y = this.rect.y;
        let w = this.rect.width;
        let h = this.rect.height;
        if (null == this.children) this.children = [];
        // 右上角
        this.children.push(new QuadTree<T>(new QuadTreeRect(x + w / 2, y, w / 2, h / 2)));
        // 左上角
        this.children.push(new QuadTree<T>(new QuadTreeRect(x, y, w / 2, h / 2)));
        // 左下角
        this.children.push(new QuadTree<T>(new QuadTreeRect(x, y + h / 2, w / 2, h / 2)));
        // 右下角
        this.children.push(new QuadTree<T>(new QuadTreeRect(x + w / 2, y + h / 2, w / 2, h / 2)));

        for (let i = 0; i < this.children.length; i++) this.children[i].depth = this.depth + 1;

        for (let i = 0; i < this.objects.length; i++) {
            let obj = this.objects[i];
            let maxChild = null;
            let maxArea = 0;
            for (let j = 0; j < this.children.length; j++) {
                let child = this.children[j];
                let contains = child.rect.contains(obj.rect);
                if (contains) {
                    child.insert(obj);
                    maxChild = null;
                    break;
                } else {
                    let area = child.rect.coincidence(obj.rect);
                    if (area > maxArea) {
                        maxChild = child;
                        maxArea = area;
                    }
                }
            }
            if (null != maxChild) {
                maxChild.insert(obj);
            }
        }

        this.objects = [];
    }

    public clear() {
        for (let i = 0; i < this.children.length; i++) {
            let child = this.children[i];
            child.clear();
        }
        this.children = [];
        for (let i = 0; i < this.objects.length; i++) {
            let object = this.objects[i];
            object = null;
        }
        this.objects = [];
        this.depth = 0;
        this.divided = false;
    }

    public highlight() {
        for (let i = 0; i < this.objects.length; i++) {
            let obj = this.objects[i];
            obj.hightlight();
        }
    }

    public destructor(): void {
        this.clear();
        this.children = null;
        this.objects = null;
    }
}
