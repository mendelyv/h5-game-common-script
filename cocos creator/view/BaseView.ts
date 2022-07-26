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
    public onOpen(params?: any) { }
    public onResume(params?: any) { }
    public onHide() { }
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
}
