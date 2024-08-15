import RedRegisterDto from "./RedRegisterDto";
import { RedType } from "./RedType";

export default class RedNode {


    public type: RedType = RedType.none;
    protected _children: RedNode[] = [];
    public parent: RedNode = null;
    public data: RedRegisterDto = null;


    public get children(): RedNode[] { return this._children; };


    public addChild(child: RedNode): RedNode {
        this._children.push(child);
        return child;
    }


    public check(): boolean {
        if (this.data.value) return true;
        for (let i = 0; i < this._children.length; i++) {
            let child = this.children[i];
            if (child.check()) return true;
        }
        return false;
    }


    public destroy(): void {
        if (this._children.length > 0) {
            for (let i = 0; i < this._children.length; i++) {
                this._children[i].destroy();
            }
        }
        this.parent = null;
    }


    // class end
}
