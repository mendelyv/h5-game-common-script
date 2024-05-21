import { EBehaviorState } from "../base/Behavior";
import BehaviorNode from "../base/BehaviorNode";

/**
 * @class: BehaviorAction
 * @description: 行为树行为节点
 * @author: Ran
 * @time: 2024-05-21 10:03:05
 */
export default class BehaviorAction extends BehaviorNode {


    /** 节点动作函数指针 */
    protected action: () => EBehaviorState;


    public constructor(func: () => EBehaviorState) {
        super();
        this.action = func;
    }


    public update(): EBehaviorState {
        if (this.action == null) return EBehaviorState.FAILURE;
        return this.action();
    }


    // class end
}
