import BehaviorTreeBuilder from "./behavior-tree/BehaviorTreeBuilder";
import ArrayUtils from "./utils/ArrayUtils";

export default class Main {
    public main() {
        console.log("hello world");
    }


    public testBehaviorTree() {
        return BehaviorTreeBuilder.test();
    }


    public testFindRectBoundaries() {
        let arr = [
            [0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0],
            [0, 1, 1, 0, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 0, 0, 0],
        ]
        let boundaries = ArrayUtils.findRectBoundaries(arr, 1);
        for (let i = 0; i < boundaries.length; i++) {
            let boundary = boundaries[i];
            console.log(` ===== start-row: ${boundary[0]} end-row: ${boundary[1]} end-row: ${boundary[2]} end-col: ${boundary[3]} ===== \n`);
        }
    }


    public testFindBoundaries() {
        let arr = [
            [0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0],
            [0, 1, 1, 0, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 0, 0, 0],
        ]
        let boundaries = ArrayUtils.findBoundaries(arr, 1);
        for(let i = 0; i < boundaries.length; i++) {
            let boundary = boundaries[i];
            console.log(` ===== row: ${boundary[0]} col: ${boundary[1]} ===== \n`);
        }
    }


}

var main = new Main();
main.main();
window["main"] = main;
