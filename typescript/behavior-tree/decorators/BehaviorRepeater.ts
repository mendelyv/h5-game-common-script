import { EBehaviorState } from "../base/Behavior";
import BehaviorDecorator from "./BehaviorDecorator";

/**
 * @class: BehaviorRepeater
 * @description: 行为树重复执行至指定次数装饰器
 * @author: Ran
 * @time: 2024-05-21 10:45:26
 */
export default class BehaviorRepeater extends BehaviorDecorator {


    /** 重复次数 */
    protected count: number;
    /** 计次器 */
    protected counter: number;


    /**
     * 
     * @param count - 重复次数
     */
    public constructor(count: number) {
        super();
        this.count = count;
    }


    public onStart(): void {
        this.counter = 0;
    }


    public update(): EBehaviorState {
        if (this.child == null) return EBehaviorState.FAILURE;
        let state = this.child.update();
        this.counter++;
        if (state == EBehaviorState.SUCCESS)
            return state;
        if (this.counter >= this.count)
            return state;
        return EBehaviorState.RUNNING;
    }


    // class end
}
