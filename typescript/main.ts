import BehaviorTreeBuilder from "./behavior-tree/BehaviorTreeBuilder";

export default class Main {
    public main() {
        console.log("hello world");
    }


    public testBehaviorTree() {
        return BehaviorTreeBuilder.test();
    }
}

var main = new Main();
main.main();
window["main"] = main;
