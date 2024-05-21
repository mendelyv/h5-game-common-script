import { EBehaviorState } from "../base/Behavior";
import BehaviorComposite from "./BehaviorComposite";

/**
 * @class: BehaviorSelector
 * @description: 行为树选择节点
 * @author: Ran
 * @time: 2024-05-21 10:28:58
 */
export default class BehaviorSelector extends BehaviorComposite {


    public update(): EBehaviorState {
        let current = this.children[this.currentChildIndex];
        let state = current.tick();

        if (state == EBehaviorState.SUCCESS) {
            this.invalidate();
            this.currentChildIndex = 0;
            return state;
        }
        if (state != EBehaviorState.FAILURE) {
            return state;
        }

        this.currentChildIndex++;
        if (this.currentChildIndex >= this.children.length) {
            this.currentChildIndex = 0;
            return EBehaviorState.FAILURE;
        }
        return EBehaviorState.RUNNING;
    }


    // class end
}
