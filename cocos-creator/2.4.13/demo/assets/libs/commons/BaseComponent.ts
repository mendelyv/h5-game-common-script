import { eventManager } from "../event/EventManager";
import Utils from "../utils/Utils";

export default class BaseComponent extends cc.Component {
    /**
     * 查找子节点
     * @param name - 子节点名称
     * @returns 
     */
    protected findChildByName(name: keyof this): cc.Node;
    /**
     * 查找子节点
     * @param name - 子节点名称
     * @param startNode - 起始节点
     * @returns 
     */
    protected findChildByName(name: keyof this, startNode: cc.Node): cc.Node;
    protected findChildByName(name: keyof this, startNode?: cc.Node): cc.Node {
        let findNode = this.node;
        if (startNode != null) findNode = startNode;
        return Utils.FindChildByName(findNode, name);
    }
    /**
     * 查找子节点组件
     * @template T extends cc.Component = cc.Component - 
     * @param name - 子节点名称
     * @param component - 组件类型
     * @returns 
     */
    protected findChildComponent<T extends cc.Component = cc.Component>(name: keyof this, component: { prototype: T }): T;
    /**
     * 查找子节点组件
     * @template T extends cc.Component = cc.Component - 
     * @param name - 子节点名称
     * @param component - 组件类型
     * @param startNode - 起始节点，缺省为根节点
     * @returns 
     */
    protected findChildComponent<T extends cc.Component = cc.Component>(name: keyof this, component: { prototype: T }, startNode: cc.Node): T;
    protected findChildComponent<T extends cc.Component = cc.Component>(name: keyof this, component: { prototype: T }, startNode?: cc.Node): T {
        let node = this.findChildByName(name, startNode);
        if (node == null) return null;
        return node.getComponent(component);
    }
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
}
