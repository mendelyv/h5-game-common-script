import ScrollViewController from "../../libs/commons/scroll/ScrollViewController";
import Utils from "../../libs/utils/Utils";
import BaseView from "../../libs/view/BaseView";
import { LayerType } from "../../libs/view/LayerManager";
import { register } from "../../libs/view/ViewConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BagPanel extends BaseView {


    public sc: ScrollViewController;


    protected onLoad(): void {
        this.sc = this.findChildComponent("sc", ScrollViewController);
        this.sc.setRender("resources://prefabs/BagRender");
        this.sc.multiple = 2;
    }


    public onOpen(params?: unknown): void {
        super.onOpen(params);
        this.updateContent();
    }


    public updateContent(): void {
        this.sc.data = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70];
    }


}
register({ viewCls: BagPanel, layer: LayerType.main_view });
