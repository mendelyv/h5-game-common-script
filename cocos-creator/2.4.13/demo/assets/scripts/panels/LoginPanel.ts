import Utils from "../../libs/utils/Utils";
import BaseView from "../../libs/view/BaseView";
import { LayerType } from "../../libs/view/LayerManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LoginPanel extends BaseView {


    public static LAYER: LayerType = LayerType.main_view;
    public static prefabPath: string = "prefabs/LoginPanel";


    public btn_start: cc.Node;


    public onOpen(params?: unknown): void {
        super.onOpen(params);
        console.log(" ===== LoginPanel onOpen ===== ");
        this.btn_start = Utils.FindChildByName(this.node, "btn_start");

        this.addButtonHandler(this.btn_start, "onStartClick");
    }


    private onStartClick() {
        console.log(" ===== LoginPanel start button click ===== ");
    }


    // class end
}
