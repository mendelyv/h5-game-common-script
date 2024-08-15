import Utils from "../../libs/utils/Utils";
import BaseView from "../../libs/view/BaseView";
import { LayerType } from "../../libs/view/LayerManager";
import { register } from "../../libs/view/ViewConst";
import { viewManager } from "../../libs/view/ViewManager";
import MainPanel from "./MainPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoginPanel extends BaseView {


    public btn_start: cc.Node;


    public onOpen(params?: unknown): void {
        super.onOpen(params);
        this.btn_start = this.findChildByName("btn_start");

        this.addButtonHandler(this.btn_start, "onStartClick");
    }


    private onStartClick() {
        viewManager.open(MainPanel);
    }


    // class end
}

register({ viewCls: LoginPanel, layer: LayerType.main_view, });
