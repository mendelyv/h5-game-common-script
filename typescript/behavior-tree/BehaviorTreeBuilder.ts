import BehaviorTree from "./BehaviorTree";
import BehaviorAction from "./actions/BehaviorAction";
import { EBehaviorState } from "./base/Behavior";
import BehaviorParallel from "./composites/BehaviorParallel";
import BehaviorSelector from "./composites/BehaviorSelector";
import BehaviorSequence from "./composites/BehaviorSequence";
import BehaviorConditionalDecorator from "./decorators/BehaviorConditionalDecorator";
import BehaviorRepeater from "./decorators/BehaviorRepeater";
import BehaviorWait from "./decorators/BehaviorWait";

export default class BehaviorTreeBuilder {
    public static test(): BehaviorTree {
        let root = new BehaviorSequence();
        let tree = new BehaviorTree(root);

        let sequence = new BehaviorSequence();
        let action1 = new BehaviorAction(() => {
            console.log(" ===== action1 sequence ===== ");
            return EBehaviorState.SUCCESS;
        });
        sequence.addChild(action1);
        let action2 = new BehaviorAction(() => {
            console.log(" ===== action2 sequence ===== ");
            return EBehaviorState.SUCCESS;
        });
        sequence.addChild(action2);
        root.addChild(sequence);

        let selector = new BehaviorSelector();
        let action3 = new BehaviorAction(() => {
            console.log(" ===== action3 sequence ===== ");
            return EBehaviorState.SUCCESS;
        });
        let actionCondition = new BehaviorConditionalDecorator(() => {
            return EBehaviorState.FAILURE;
        });
        actionCondition.child = action3;
        let action3Repeater = new BehaviorRepeater(5);
        action3Repeater.child = actionCondition;
        selector.addChild(action3Repeater);

        let action4 = new BehaviorAction(() => {
            console.log(" ===== action4 sequence ===== ");
            return EBehaviorState.SUCCESS;
        });
        let action4Wait = new BehaviorWait(10000);
        action4Wait.child = action4;
        selector.addChild(action4Wait);
        let action5 = new BehaviorAction(() => {
            console.log(" ===== action5 sequence ===== ");
            return EBehaviorState.SUCCESS;
        });
        action5.priority = 100;
        selector.addChild(action5);
        selector.sortChildren();
        root.addChild(selector);

        let parallel = new BehaviorParallel();
        let action6 = new BehaviorAction(() => {
            console.log(" ===== action6 sequence ===== ");
            return EBehaviorState.SUCCESS;
        });
        parallel.addChild(action6);
        let action7 = new BehaviorAction(() => {
            console.log(" ===== action7 sequence ===== ");
            return EBehaviorState.SUCCESS;
        });
        parallel.addChild(action7);
        root.addChild(parallel);

        return tree;
    }
}
