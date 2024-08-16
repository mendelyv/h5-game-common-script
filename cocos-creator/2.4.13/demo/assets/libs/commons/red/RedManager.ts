import { eventManager } from "../../event/EventManager";
import { getRegisteredReds } from "./RedConst";
import RedTree from "./RedTree";
import { RedType } from "./RedType";

export class RedManager {


    private static _instance: RedManager;
    public static get instance(): RedManager {
        this._instance || (this._instance = new RedManager());
        return this._instance;
    }


    private _tree: RedTree;


    public init(): void {
        let reds = getRegisteredReds();
        this._tree = new RedTree();
        this._tree.generate(reds);
    }


    public check(type: RedType): boolean {
        let node = this._tree.getNode(type);
        if (node == null) return false;
        return node.check();
    }


    public change(type: RedType, value: boolean): void {
        let node = this._tree.getNode(type);
        if (node == null) return;
        if (node.data.value == value) return;
        node.data.value = value;
        eventManager.dispatch("red_state_update", type);
    }


    // class end
}

export const redManager = RedManager.instance;
window["redManager"] = redManager;
