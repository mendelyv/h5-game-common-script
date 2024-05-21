import BehaviorNode from "./base/BehaviorNode";

/**
 * @class: BehaviorTree
 * @description: 行为树
 * @author: Ran
 * @time: 2024-05-21 10:43:05
 */
export default class BehaviorTree {


    private root: BehaviorNode;


    public constructor(root: BehaviorNode) {
        this.root = root;
    }


    public tick() {
        this.root.tick();
    }


    // class end
}
