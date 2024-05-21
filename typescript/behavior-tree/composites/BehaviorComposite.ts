import BehaviorNode from "../base/BehaviorNode";

/**
 * @class: BehaviorComposite
 * @description: 行为树组合节点基类
 * @author: Ran
 * @time: 2024-05-21 10:06:33
 */
export default abstract class BehaviorComposite extends BehaviorNode {


    protected children: Array<BehaviorNode> = [];
    protected currentChildIndex: number = 0;


    public invalidate(): void {
        super.invalidate();
        if (this.children && this.children.length > 0)
            for (let i = 0; i < this.children.length; i++)
                this.children[i].invalidate();
    }


    public onStart(): void {
        super.onStart();
        this.currentChildIndex = 0;
    }


    public addChild(child: BehaviorNode): void {
        this.children.push(child);
    }


    // class end
}
