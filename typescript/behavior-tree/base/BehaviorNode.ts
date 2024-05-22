import { EBehaviorState } from "./Behavior";

/**
 * @class: BehaviorNode
 * @description: 行为树节点基类
 * @author: Ran
 * @time: 2024-05-21 10:03:54
 */
export default abstract class BehaviorNode {


    public state: EBehaviorState = EBehaviorState.NONE;
    public priority: number = 0;


    public abstract update(): EBehaviorState;


    /* 无效化节点 */
    public invalidate() {
        this.state = EBehaviorState.NONE;
    }


    public onStart() { }
    public onEnd() { }


    /**
     * 执行节点生命周期
     * @returns 
     */
    public tick(): EBehaviorState {
        if (this.state == EBehaviorState.NONE)
            this.onStart();

        this.state = this.update();

        if (this.state != EBehaviorState.RUNNING)
            this.onEnd();

        return this.state;
    }


    // class end
}
