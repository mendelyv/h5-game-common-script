import { redManager } from "../libs/commons/red/RedManager";
import LayerManager from "../libs/view/LayerManager";
import { viewManager } from "../libs/view/ViewManager";
import LoginPanel from "./panels/LoginPanel";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Main extends cc.Component {


    start () {
        LayerManager.init(this.node.parent);
        viewManager.init();
        redManager.init();
        viewManager.open(LoginPanel);
    }


    // class end
}
