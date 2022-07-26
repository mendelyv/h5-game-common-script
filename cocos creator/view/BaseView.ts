import { ContainerType } from "../../common/ContainerManager";
import { eventManager } from "../../common/EventManager";
import Utils from "../../common/Utils";

const { ccclass } = cc._decorator;

/**
 * @class name : BaseView
 * @description : 基础界面
 * @author : Ran
 * @time : 2022.07.19
 */
@ccclass
export default class BaseView extends cc.Component {
    public static LAYER: ContainerType;
    public static prefabPath: string;
    public prefabName: string;
    public adapterScaleNodes: cc.Node[] = [];
    public adapterWidgetNodes: cc.Node[] = [];
    start() {
        this.screenAdapter();
    }
    public onOpen(params?: any) { }
    public onResume(params?: any) { }
    public onClose(params?: any) { }
    public onDestory() { }
    public addButtonHandler(target: cc.Node | cc.Button, functionName: string, data?: any, scriptNode?: cc.Node, scriptName?: string) {
        if (!scriptNode) scriptNode = this.node;
        if (!scriptNode) {
            console.error(`${cc.js.getClassName(this)}.addButtonClickHandler: scriptNode is null`);
            return false;
        }
        if (!scriptName || scriptName == "") scriptName = cc.js.getClassName(this);
        if (!scriptName || scriptName == "") {
            console.error(`${cc.js.getClassName(this)}.addButtonClickHandler: scriptName is null`);
            return false;
        }
        return Utils.addButtonClickHandler(target, scriptNode, scriptName, functionName, data);
    }
    public addEvent(type, cb: Function) {
        eventManager.addEvent(type, cb, this);
    }
    public removeEvent(type, cb: Function) {
        eventManager.removeEvent(type, cb, this);
    }
    public static getContainer(): cc.Node { return null; }
    public screenAdapter() {
        if(this.adapterScaleNodes.length < 0) return;
        if(!this.needAdapter()) return;

        let designHeight = cc.view.getDesignResolutionSize().height;
        let screenHeight = cc.winSize.height;

        for(let i = 0; i < this.adapterScaleNodes.length; i++) {
            let node = this.adapterScaleNodes[i];
            let scale = node.scale;
            node.scale = scale * screenHeight / designHeight;
        }
        this.adapterScaleNodes = [];

        for(let i = 0; i < this.adapterWidgetNodes.length; i++) {
            let node = this.adapterWidgetNodes[i];
            let widget = node.getComponent(cc.Widget);
            if(!widget) continue;
            if(widget.left) widget.left = widget.left * screenHeight / designHeight;
            if(widget.right) widget.right = widget.right * screenHeight / designHeight;
            if(widget.top) widget.top = widget.top * screenHeight / designHeight;
            if(widget.bottom) widget.bottom = widget.bottom * screenHeight / designHeight;
            if(widget.horizontalCenter) widget.horizontalCenter = widget.horizontalCenter * screenHeight / designHeight;
            if(widget.verticalCenter) widget.verticalCenter = widget.verticalCenter * screenHeight / designHeight;
        }
        this.adapterWidgetNodes = [];
    }
    protected needAdapter() {
        let designHeight = cc.view.getDesignResolutionSize().height;
        // let screenHeight = cc.winSize.height;
        let screenHeight = document.body.offsetHeight;
        if(screenHeight < designHeight) return true;
        return false;
    }
}
