import { assetManager } from "../assets/AssetManager";
import BaseView from "./BaseView";
import LayerManager from "./LayerManager";
import ViewConst, { getRegisteredViews } from "./ViewConst";
import ViewTree from "./ViewTree";
import ViewRegisterDto from "./ViewRegisterDto";
import ViewTreeNode from "./ViewTreeNode";
import StringUtils from "../utils/StringUtils";


/**
 * @class name : ViewManager
 * @description : 界面管理
 * @author : Ran
 * @time : 2022.07.19
 */
export class ViewManager {


    private static _instance: ViewManager;
    public static get instance(): ViewManager {
        this._instance || (this._instance = new ViewManager());
        return this._instance;
    }


    private tree: ViewTree;
    private viewDictionary: { [key: number | string]: ViewRegisterDto };
    private viewDictionaryByName: { [className: string]: ViewRegisterDto };
    private viewNodes: { [viewID: number]: cc.Node } = {};
    private viewOpenedArray: ViewRegisterDto[] = [];


    public init(): void {
        let views = getRegisteredViews();
        this.viewDictionary = {};
        this.viewDictionaryByName = {};
        for (let i = 0; i < views.length; i++) {
            let view = views[i];
            this.viewDictionary[view.id] = view;
            let className = this.getViewClassName(view.viewCls);
            this.viewDictionaryByName[className] = view;
        }
        this.tree = new ViewTree();
        this.tree.generate(views);
    }


    /**
     * 获取界面注册数据
     * @param value - 界面类
     * @returns 
     */
    public getViewRegisterDto(value: unknown): ViewRegisterDto;
    /**
     * 获取界面注册数据
     * @param value - 界面字符串id
     * @returns 
     */
    public getViewRegisterDto(value: string): ViewRegisterDto;
    /**
     * 获取界面注册数据
     * @param value - 界面数字id
     * @returns 
     */
    public getViewRegisterDto(value: number): ViewRegisterDto;
    public getViewRegisterDto(value: unknown): ViewRegisterDto {
        let dto = null;
        if (typeof value == "number" || typeof value == "string") {
            dto = this.viewDictionary[value];
            if (dto != null) return dto;
            dto = this.viewDictionaryByName[value];
        } else if (typeof value == "function") {
            let className = this.getViewClassName(value);
            dto = this.viewDictionaryByName[className];
        }
        return dto;
    }


    /**
     * 打开界面
     * @template T extends cc.Node = cc.Node - 
     * @param cls - 界面类
     * @param params - 开启参数
     * @returns 界面节点
     */
    public async open<T extends cc.Node = cc.Node>(cls: unknown, params?: unknown): Promise<T>;
    /**
     * 打开界面
     * @template T extends cc.Node = cc.Node - 
     * @param cls - 界面字符串id
     * @param params - 开启参数
     * @returns 界面节点
     */
    public async open<T extends cc.Node = cc.Node>(viewID: string, params?: unknown): Promise<T>;
    /**
     * 打开界面
     * @template T extends cc.Node = cc.Node - 
     * @param cls - 界面数字id
     * @param params - 开启参数
     * @returns 界面节点
     */
    public async open<T extends cc.Node = cc.Node>(viewID: number, params?: unknown): Promise<T>;
    public async open<T extends cc.Node = cc.Node>(cls: unknown, params?: unknown): Promise<T> {
        let viewDto: ViewRegisterDto = this.getViewRegisterDto(cls);
        if (viewDto == null) {
            console.error(` ***** view ${cls} has not registered ***** `);
            return;
        }

        let index = this.getViewShowIndex(viewDto.id);
        if (index > -1) return this.resume(cls) as T;

        let className = this.getViewClassName(viewDto.viewCls);
        let prefabPathPrefix = viewDto.prefabPathPrefix;
        if (StringUtils.empty(prefabPathPrefix)) {
            prefabPathPrefix = ViewConst.defaultPrefabPathPrefix;
        }

        // 获取之前的节点存储
        let node = this.viewNodes[viewDto.id] as T;
        if (!node) {
            let prefabName = viewDto.prefabName;
            if (prefabName == null) {
                prefabName = className;
            }
            let prefabPath = prefabPathPrefix + prefabName;
            node = await assetManager.createPrefab(prefabPath) as T;
            if (!node) {
                console.error(` ***** open ${className} failed ${prefabName} is not exist ***** `);
                return;
            }
            node.name = className;
            this.viewNodes[viewDto.id] = node;
            this.analyzeViewScript(node, className);
            this.addBlockInputEvent(node);
        }

        //获取到前一个页面
        let previousView = this.viewOpenedArray[this.viewOpenedArray.length - 1];
        if (previousView != null) {
            let preView = this.getViewNode(previousView);
            if (preView != null) {
                let preScript: BaseView = this.getViewScript(previousView);
                if (preScript) {
                    if (preScript.onClose != null)
                        preScript.onClose();
                }
            } else {
                console.warn(` ----- ${this.getViewClassName(previousView.viewCls)} is not show, but viewOpenedArray has save, check it ----- `);
            }
        }

        // 添加到父节点
        let viewContainer = LayerManager.getLayer(viewDto.layer);
        if (viewContainer == null) {
            console.warn(` ----- open ${className} field container is null ----- `)
            return;
        }
        viewContainer.addChild(node);
        this.viewOpenedArray.push(viewDto);

        // 调用界面控制脚本
        let script = this.getViewScript(viewDto);
        if (script) {
            if (script.onOpen != null)
                script.onOpen(params);
        } else {
            // console.warn(`${prefabName} has not view controller`);
        }

        return node;
    }


    /**
     * 恢复界面
     * @template T extends cc.Node = cc.Node - 
     * @param cls - 界面类
     * @param params - 开启参数
     * @returns 
     */
    public resume<T extends cc.Node = cc.Node>(cls: unknown, params?: unknown): T;
    /**
     * 恢复界面
     * @template T extends cc.Node = cc.Node - 
     * @param viewID - 界面字符串id
     * @param params - 开启参数
     * @returns 
     */
    public resume<T extends cc.Node = cc.Node>(viewID: string, params?: unknown): T;
    /**
     * 恢复界面
     * @template T extends cc.Node = cc.Node - 
     * @param viewID - 界面数字id
     * @param params - 开启参数
     * @returns 
     */
    public resume<T extends cc.Node = cc.Node>(viewID: number, params?: unknown): T;
    public resume<T extends cc.Node = cc.Node>(cls: unknown, params?: unknown): T {
        let viewDto: ViewRegisterDto = this.getViewRegisterDto(cls);
        if (viewDto == null) {
            console.error(` ***** view ${cls} has not registered ***** `);
            return;
        }

        let className = this.getViewClassName(viewDto.viewCls);
        let index = this.getViewShowIndex(viewDto.id);
        if (index <= -1) {
            console.warn(` ----- ${className} is not show ----- `);
            return null;
        }
        let node = this.viewNodes[viewDto.id] as T;
        let container = node.parent;
        if (!container) {
            console.warn(` ----- ${className} is not show ----- `);
            return null;
        }
        if (node.getSiblingIndex() === container.children.length - 1) {
            console.warn(` ----- ${className} is already top show ----- `);
            return node;
        }
        node.setSiblingIndex(container.children.length - 1);

        //获取到前一个页面
        let previousView = this.viewOpenedArray[this.viewOpenedArray.length - 1];
        if (previousView != null) {
            let preView = this.getViewNode(previousView);
            if (preView != null) {
                let preScript = this.getViewScript(previousView);
                if (preScript) {
                    if (preScript.onClose != null)
                        preScript.onClose();
                }
            } else {
                console.warn(` ----- ${this.getViewClassName(previousView.viewCls)} is not show, but viewOpenedArray has save, check it ----- `);
            }
        }

        let temp = this.viewOpenedArray.splice(index, 1)[0];
        this.viewOpenedArray.push(temp);

        let script = this.getViewScript(viewDto);
        if (script) {
            if (script.onResume != null)
                script.onResume(params);
        } else {
            // console.warn(`${className} has not view controller`);
        }
        return node;
    }


    /**
     * 辅助界面预制体控制脚本挂载
     * @param node - 
     * @param scriptName - 
     */
    private analyzeViewScript(node: cc.Node, scriptName: string) {
        let has = node.getComponent(scriptName) != null;
        if (!has) node.addComponent(scriptName);
    }


    /**
     * 添加阻止输入事件组件
     * @param node - 
     */
    private addBlockInputEvent(node: cc.Node) {
        if (!node) return;
        if (!node.getComponent(cc.BlockInputEvents)) node.addComponent(cc.BlockInputEvents);
    }


    /**
     * 关闭界面
     * @template T extends cc.Node = cc.Node - 
     * @param cls - 界面类
     * @param params - 
     * @returns 
     */
    public close<T extends cc.Node = cc.Node>(cls: unknown, params?: unknown): T;
    /**
     * 关闭界面
     * @template T extends cc.Node = cc.Node - 
     * @param viewID - 界面字符串id
     * @param params - 
     * @returns 
     */
    public close<T extends cc.Node = cc.Node>(viewID: string, params?: unknown): T;
    /**
     * 关闭界面
     * @template T extends cc.Node = cc.Node - 
     * @param viewID - 界面数字id
     * @param params - 
     * @returns 
     */
    public close<T extends cc.Node = cc.Node>(viewID: number, params?: unknown): T;
    public close<T extends cc.Node = cc.Node>(cls: unknown, params?: unknown): T {
        let viewDto: ViewRegisterDto = this.getViewRegisterDto(cls);
        if (viewDto == null) {
            console.error(` ***** view ${cls} has not registered ***** `);
            return;
        }

        let className = this.getViewClassName(viewDto.viewCls);
        let index = this.getViewShowIndex(viewDto.id);
        if (index < 0) {
            console.warn(` ----- ${className} is not show ----- `);
            return null;
        }
        let node = this.viewNodes[viewDto.id] as T;
        if (!node) {
            console.warn(` ---- ${className} has not node, but viewOpenedArray has save, check it ----- `);
            return null;
        }
        this.removeFromParent(node);
        this.viewOpenedArray.splice(index, 1);
        let script = this.getViewScript(viewDto);
        if (script) {
            if (script.onClose)
                script.onClose(params);
        } else {
            // console.warn(`${className} has not view controller`);
        }

        return node;
    }


    /**
     * 销毁界面
     * @param cls - 界面类
     */
    public destroy(cls: unknown): void;
    /**
     * 销毁界面
     * @param viewID - 界面数字id
     */
    public destroy(viewID: number): void;
    /**
     * 销毁界面
     * @param viewID - 界面字符串id
     */
    public destroy(viewID: string): void;
    public destroy(cls: unknown): void {
        let viewDto: ViewRegisterDto = this.getViewRegisterDto(cls);
        if (viewDto == null) {
            console.error(` ***** view ${cls} has not registered ***** `);
            return;
        }
        this.close(cls);
        let className = this.getViewClassName(viewDto.viewCls);
        let script = this.getViewScript(viewDto);
        if (script) {
            if (script.onDestroy)
                script.onDestroy();
        }
        delete this.viewNodes[viewDto.id];
    }


    private removeFromParent(node: cc.Node) {
        if (!node || !node.parent) return;
        node.parent.removeChild(node);
    }


    private getViewNode(dto: ViewRegisterDto) {
        return this.viewNodes[dto.id] || null;
    }


    private getViewScript<T extends BaseView = BaseView>(dto: ViewRegisterDto): T {
        let className = this.getViewClassName(dto.viewCls);
        let node = this.viewNodes[dto.id];
        if (!node) {
            console.error(` ***** getViewController ${className} is not exist ***** `);
            return null;
        }
        return node.getComponent(className);
    }


    /**
     * 获取界面类名
     * @param cls - 界面类
     * @returns 界面类名称字符串
     */
    private getViewClassName(cls: unknown) {
        let className = "";
        if (typeof cls === "string") className = cls;
        else if (typeof cls === "function") className = cc.js.getClassName(cls);
        else if (typeof cls === "object") className = cc.js.getClassName(cls.constructor);
        else
            console.error("ViewManager.getViewClassName: cls is not string or function");
        return className;
    }


    private getViewShowIndex(dto: ViewRegisterDto): number;
    /**
     * 获取界面显示队列index
     * @param cls - 界面类
     * @returns 
     */
    private getViewShowIndex(cls: unknown): number;
    /**
     * 获取界面显示队列index
     * @param viewID - 界面数字id
     * @returns 
     */
    private getViewShowIndex(viewID: number): number;
    /**
     * 获取界面显示队列index
     * @param viewID - 界面字符串id
     * @returns 
     */
    private getViewShowIndex(viewID: string): number;
    private getViewShowIndex(cls: unknown) {
        if (typeof cls == "number" || typeof cls == "string") {
            return this.getViewShowIndexByViewID(cls);
        } else if (typeof cls == "function") {
            let className = this.getViewClassName(cls);
            return this.getViewShowIndexByViewName(className);
        } else if (typeof cls == "object") {
            let id = (cls as ViewRegisterDto).id;
            this.getViewShowIndexByViewID(id);
        }
        return -1;
    }


    private getViewShowIndexByViewName(className: string): number {
        for (let i = 0; i < this.viewOpenedArray.length; i++) {
            let view = this.viewOpenedArray[i];
            let name = this.getViewClassName(view.viewCls);
            if (className == name) return i;
        }
        return -1;
    }


    private getViewShowIndexByViewID(viewID: number | string): number {
        for (let i = 0; i < this.viewOpenedArray.length; i++) {
            let view = this.viewOpenedArray[i];
            if (view.id == viewID) return i;
        }
        return -1;
    }


    // class end
}

export const viewManager = ViewManager.instance;
window["viewManager"] = viewManager;
