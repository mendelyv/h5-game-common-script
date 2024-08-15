import ScrollViewRender from "../../libs/commons/scroll/ScrollViewRender";
import Utils from "../../libs/utils/Utils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BagRender extends ScrollViewRender {


    public dto: number;


    public lb_name: cc.Label;


    protected onLoad(): void {
        this.lb_name = this.findChildComponent("lb_name", cc.Label);
    }


    public updateContent(): void {
        this.lb_name.string = this.dto + "";
    }


    // update (dt) {}
}
