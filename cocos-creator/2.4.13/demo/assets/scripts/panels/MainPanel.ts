import { registerRed } from "../../libs/commons/red/RedConst";
import { RedType } from "../../libs/commons/red/RedType";
import BaseView from "../../libs/view/BaseView";
import { LayerType } from "../../libs/view/LayerManager";
import { registerView } from "../../libs/view/ViewConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainPanel extends BaseView {


    start() {

    }


}
registerView({ viewCls: MainPanel, layer: LayerType.main_view });
registerRed({ type: RedType.main_panel });
