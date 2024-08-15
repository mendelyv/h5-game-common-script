import { RedType } from "./RedType";

export default class RedNode {


    public type: RedType = RedType.none;
    protected _children: RedNode[] = [];
    public parent: RedNode = null;


    public get children(): RedNode[] { return this._children; };


    public addChild(child: RedNode): RedNode {
        this._children.push(child);
        return child;
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
