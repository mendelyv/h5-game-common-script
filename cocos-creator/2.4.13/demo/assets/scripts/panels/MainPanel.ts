import BaseView from "../../libs/view/BaseView";
import { LayerType } from "../../libs/view/LayerManager";
import { register } from "../../libs/view/ViewConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainPanel extends BaseView {


    start() {

    }


}
register({ viewCls: MainPanel, layer: LayerType.main_view });
