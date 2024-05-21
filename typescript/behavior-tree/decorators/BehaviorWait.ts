import { EBehaviorState } from "../base/Behavior";
import BehaviorDecorator from "./BehaviorDecorator";

/**
 * @class: BehaviorWait
 * @description: 行为树等待装饰器
 * @author: Ran
 * @time: 2024-05-21 10:39:57
 */
export default class BehaviorWait extends BehaviorDecorator {


    protected timestamp: number;
    protected time: number;


    public constructor(time: number) {
        super();
        this.time = time;
    }


    public onStart(): void {
        this.timestamp = Date.now() + this.time;
    }


    public update(): EBehaviorState {
        if (Date.now() >= this.timestamp) {
            if (this.child == null) return EBehaviorState.FAILURE;
            return this.child.update();
        }
        return EBehaviorState.RUNNING;
    }


    // class end
}
