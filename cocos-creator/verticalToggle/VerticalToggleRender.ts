import { eventManager } from "../../../common/EventManager";
import { Event } from "../../../Event";

const {ccclass, property} = cc._decorator;

@ccclass
export default class VerticalToggleRender extends cc.Component {

    protected label: cc.Label;
    
    public data: any;

    onLoad() {
        this.label = this.node.getChildByName("label").getComponent(cc.Label);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClick, this);
    }


    public updateData(data: any) {
        this.data = data;
        this.label.string = data;
    }


    private onClick() {
        eventManager.dispatch(Event.ToggleRenderClick, this.data);
    }
}
