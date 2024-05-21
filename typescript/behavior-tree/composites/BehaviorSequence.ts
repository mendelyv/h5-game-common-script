import { EBehaviorState } from "../base/Behavior";
import BehaviorComposite from "./BehaviorComposite";

/**
 * @class: BehaviorSequence
 * @description: 行为树顺序序列节点
 * @author: Ran
 * @time: 2024-05-21 10:21:49
 */
export default class BehaviorSequence extends BehaviorComposite {


    public update(): EBehaviorState {
        if (this.children.length <= 0)
            return EBehaviorState.FAILURE;

        let current = this.children[this.currentChildIndex];
        let state = current.update();
        // 节点失败或者运行中则返回
        if (state != EBehaviorState.SUCCESS)
            return state;

        this.currentChildIndex++;
        // 节点运行至最后一个即为整个序列运行成功
        if (this.currentChildIndex >= this.children.length) {
            this.currentChildIndex = 0;
            return EBehaviorState.SUCCESS;
        }

        return EBehaviorState.RUNNING;
    }


    // class end
}
