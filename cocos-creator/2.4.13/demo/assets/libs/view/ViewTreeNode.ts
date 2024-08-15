import ViewRegisterDto from "./ViewRegisterDto";

/**
 * @class: ViewTreeNode
 * @description: 视图树节点
 * @author: Ran
 * @time: 2024-08-13 14:05:29
 */
export default class ViewTreeNode {


    public parent: ViewTreeNode = null;
    protected _children: ViewTreeNode[] = [];
    public get children(): ViewTreeNode[] { return this._children; };
    public data: ViewRegisterDto = null;


    public addChild(child: ViewTreeNode): ViewTreeNode {
        this._children.push(child);
        return child;
    }


    public destroy(): void {
        if (this._children.length > 0) {
            for (let i = 0; i < this._children.length; i++) {
                this._children[i].destroy();
            }
        }
        this._children = null;
        this.parent = null;
        this.data = null;
    }


}
