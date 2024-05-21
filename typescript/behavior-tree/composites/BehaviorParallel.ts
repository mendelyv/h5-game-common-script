import { EBehaviorState } from "../base/Behavior";
import BehaviorComposite from "./BehaviorComposite";

/**
 * @class: BehaviorParallel
 * @description: 行为树并行节点
 * @author: Ran
 * @time: 2024-05-21 10:31:18
 */
export default class BehaviorParallel extends BehaviorComposite {


    public update(): EBehaviorState {
        let success = true;
        for (let i = 0; i < this.children.length; i++) {
            let child = this.children[i];
            child.tick();
            if (child.state == EBehaviorState.FAILURE)
                return EBehaviorState.FAILURE;
            else if (child.state != EBehaviorState.SUCCESS)
                success = false;
        }
        if (success) return EBehaviorState.SUCCESS;
        return EBehaviorState.RUNNING;
    }


    // class end
}
