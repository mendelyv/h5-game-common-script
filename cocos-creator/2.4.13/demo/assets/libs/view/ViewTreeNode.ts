import ViewRegisterDto from "./ViewRegisterDto";

/**
 * @class: ViewTreeNode
 * @description: 视图树节点
 * @author: Ran
 * @time: 2024-08-13 14:05:29
 */
export default class ViewTreeNode {


    public parent: ViewTreeNode = null;
    protected children: ViewTreeNode[] = [];
    public data: ViewRegisterDto = null;


    public addChild(child: ViewTreeNode): ViewTreeNode {
        this.children.push(child);
        return child;
    }


    public destroy(): void {
        if (this.children.length > 0) {
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].destroy();
            }
        }
        this.children = null;
        this.parent = null;
        this.data = null;
    }


}
