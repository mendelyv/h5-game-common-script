import { EBehaviorState } from "../base/Behavior";
import BehaviorDecorator from "./BehaviorDecorator";

/**
 * @class: BehaviorConditionalDecorator
 * @description: 行为树条件装饰器
 * @author: Ran
 * @time: 2024-05-21 10:36:47
 */
export default class BehaviorConditionalDecorator extends BehaviorDecorator {


    protected condition: () => EBehaviorState;
    protected conditionState: EBehaviorState = EBehaviorState.NONE;


    public constructor(func: () => EBehaviorState) {
        super();
        this.condition = func;
    }


    public invalidate(): void {
        super.invalidate();
        this.conditionState = EBehaviorState.NONE;
    }


    public update(): EBehaviorState {
        if (this.condition == null) return EBehaviorState.SUCCESS;
        if (this.child == null) return EBehaviorState.SUCCESS;

        let state = this.condition();
        if (state == EBehaviorState.SUCCESS)
            return this.child.tick();
        return EBehaviorState.FAILURE;
    }


    public executeCondition(force: boolean = false): EBehaviorState {
        if (force || this.conditionState == EBehaviorState.NONE)
            this.conditionState = this.condition();
        return this.conditionState;
    }


    // class end
}
