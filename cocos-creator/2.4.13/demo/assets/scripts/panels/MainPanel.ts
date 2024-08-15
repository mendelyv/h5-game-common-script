import { registerRed } from "../../libs/commons/red/RedConst";
import { RedType } from "../../libs/commons/red/RedType";
import BaseView from "../../libs/view/BaseView";
import { LayerType } from "../../libs/view/LayerManager";
import { registerView } from "../../libs/view/ViewConst";
import { viewManager } from "../../libs/view/ViewManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainPanel extends BaseView {


    public btn_bag: cc.Node;


    protected onLoad(): void {
        this.btn_bag = this.findChildByName("btn_bag");
        this.addButtonHandler(this.btn_bag, "onBagClick");
    }


    start() {

    }


    private onBagClick() {
        viewManager.open("BagPanel");
    }


}
registerView({ viewCls: MainPanel, layer: LayerType.main_view });
registerRed({ type: RedType.main_panel });
