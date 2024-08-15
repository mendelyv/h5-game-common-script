import { LayerType } from "./LayerManager";
import { eventManager } from "../event/EventManager";
import Utils from "../utils/Utils";
import { viewManager } from "./ViewManager";
import BaseComponent from "../commons/BaseComponent";


/**
 * @class name : BaseView
 * @description : 基础界面
 * @author : Ran
 * @time : 2022.07.19
 */
export default class BaseView extends BaseComponent {
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
    protected start(): void {
        this.screenAdapter();
    }
    /** 界面开启回调 */
    public onOpen(params?: unknown) { }
    /** 界面恢复回调 */
    public onResume(params?: unknown) { }
    public onClose(params?: unknown) { }
    public onDestroy() { }
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
    public close() {
        viewManager.close(this);
    }
}
