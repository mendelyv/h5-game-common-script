import { LayerType } from "./LayerManager";
import { eventManager } from "../event/EventManager";
import Utils from "../utils/Utils";


/**
 * @class name : BaseView
 * @description : 基础界面
 * @author : Ran
 * @time : 2022.07.19
 */
export default class BaseView extends cc.Component {
    /** 添加的界面层级 */
    public static LAYER: LayerType;
    /** 预制体路径 */
    public static prefabPath: string;
    /** 预制体名称 */
    public prefabName: string;
    /** 适配缩放节点 */
    public adapterScaleNodes: cc.Node[] = [];
    /** 适配约束节点 */
    public adapterWidgetNodes: cc.Node[] = [];
    start() {
        this.screenAdapter();
    }
    /** 界面开启回调 */
    public onOpen(params?: unknown) { }
    /** 界面恢复回调 */
    public onResume(params?: unknown) { }
    public onClose(params?: unknown) { }
    public onDestory() { }
    /**
     * 添加按钮点击事件
     * @param target - 按钮
     * @param functionName - 回调函数名
     * @param data - 回调参数
     * @param scriptNode - 脚本节点
     * @param scriptName - 脚本名称
     * @returns 
     */
    public addButtonHandler(target: cc.Node | cc.Button, functionName: string, data?: unknown, scriptNode?: cc.Node, scriptName?: string) {
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
    /**
     * 添加事件
     * @param type - 
     * @param cb - 
     */
    public addEvent(type: number | string, cb: Function) {
        eventManager.addEvent(type, cb, this);
    }
    /**
     * 移除事件
     * @param type - 
     * @param cb - 
     */
    public removeEvent(type: number | string, cb: Function) {
        eventManager.removeEvent(type, cb, this);
    }
    /**
     * 获取层级节点
     * @returns 
     */
    public static getLayer(): cc.Node { return null; }
    public screenAdapter() {
        if (this.adapterScaleNodes.length < 0) return;
        if (!this.needAdapter()) return;

        let designHeight = cc.view.getDesignResolutionSize().height;
        let screenHeight = cc.winSize.height;

        for (let i = 0; i < this.adapterScaleNodes.length; i++) {
            let node = this.adapterScaleNodes[i];
            let scale = node.scale;
            node.scale = scale * screenHeight / designHeight;
        }
        this.adapterScaleNodes = [];

        for (let i = 0; i < this.adapterWidgetNodes.length; i++) {
            let node = this.adapterWidgetNodes[i];
            let widget = node.getComponent(cc.Widget);
            if (!widget) continue;
            if (widget.left) widget.left = widget.left * screenHeight / designHeight;
            if (widget.right) widget.right = widget.right * screenHeight / designHeight;
            if (widget.top) widget.top = widget.top * screenHeight / designHeight;
            if (widget.bottom) widget.bottom = widget.bottom * screenHeight / designHeight;
            if (widget.horizontalCenter) widget.horizontalCenter = widget.horizontalCenter * screenHeight / designHeight;
            if (widget.verticalCenter) widget.verticalCenter = widget.verticalCenter * screenHeight / designHeight;
        }
        this.adapterWidgetNodes = [];
    }
    protected needAdapter() {
        let designHeight = cc.view.getDesignResolutionSize().height;
        // let screenHeight = cc.winSize.height;
        let screenHeight = document.body.offsetHeight;
        if (screenHeight < designHeight) return true;
        return false;
    }
}
