import { assetManager } from "../assets/AssetManager";
import BaseView from "./BaseView";
import LayerManager from "./LayerManager";
import ViewConst, { getRegisteredViews, getViewRegisterDto } from "./ViewConst";
import ViewTree from "./ViewTree";
import ViewRegisterDto from "./ViewRegisterDto";
import StringUtils from "../utils/StringUtils";
import Utils from "../utils/Utils";


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


    private _tree: ViewTree;
    private viewNodes: { [id: number]: BaseView } = {};
    private viewOpenedArray: ViewRegisterDto[] = [];


    public get tree(): ViewTree { return this._tree; }


    public init(): void {
        let views = getRegisteredViews();
        this._tree = new ViewTree();
        this._tree.generate(views);
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
     * @param viewName - 界面字符串id
     * @param params - 开启参数
     * @returns 界面节点
     */
    public async open<T extends cc.Node = cc.Node>(viewName: string, params?: unknown): Promise<T>;
    /**
     * 打开界面
     * @template T extends cc.Node = cc.Node - 
     * @param id - 界面数字id
     * @param params - 开启参数
     * @returns 界面节点
     */
    public async open<T extends cc.Node = cc.Node>(id: number, params?: unknown): Promise<T>;
    public async open<T extends cc.Node = cc.Node>(v: unknown, params?: unknown): Promise<T> {
        let viewDto: ViewRegisterDto = getViewRegisterDto(v);
        if (viewDto == null) {
            console.error(` ***** view ${v} has not registered ***** `);
            return;
        }

        let index = this.getViewShowIndex(viewDto.id);
        if (index > -1) return this.resume(v) as T;

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
            Utils.addNodeScript(node, viewDto.viewCls);
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
     * @param viewName - 界面字符串id
     * @param params - 开启参数
     * @returns 
     */
    public resume<T extends cc.Node = cc.Node>(viewName: string, params?: unknown): T;
    /**
     * 恢复界面
     * @template T extends cc.Node = cc.Node - 
     * @param id - 界面数字id
     * @param params - 开启参数
     * @returns 
     */
    public resume<T extends cc.Node = cc.Node>(id: number, params?: unknown): T;
    public resume<T extends cc.Node = cc.Node>(v: unknown, params?: unknown): T {
        let viewDto: ViewRegisterDto = getViewRegisterDto(v);
        if (viewDto == null) {
            console.error(` ***** view ${v} has not registered ***** `);
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
     * @param viewName - 界面字符串id
     * @param params - 
     * @returns 
     */
    public close<T extends cc.Node = cc.Node>(viewName: string, params?: unknown): T;
    /**
     * 关闭界面
     * @template T extends cc.Node = cc.Node - 
     * @param id - 界面数字id
     * @param params - 
     * @returns 
     */
    public close<T extends cc.Node = cc.Node>(id: number, params?: unknown): T;
    public close<T extends cc.Node = cc.Node>(v: unknown, params?: unknown): T {
        let viewDto: ViewRegisterDto = getViewRegisterDto(v);
        if (viewDto == null) {
            console.error(` ***** view ${v} has not registered ***** `);
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
     * @param id - 界面数字id
     */
    public destroy(id: number): void;
    /**
     * 销毁界面
     * @param viewName - 界面字符串id
     */
    public destroy(viewName: string): void;
    public destroy(v: unknown): void {
        let viewDto: ViewRegisterDto = getViewRegisterDto(v);
        if (viewDto == null) {
            console.error(` ***** view ${v} has not registered ***** `);
            return;
        }
        this.close(v);
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


    private getViewNode(dto: ViewRegisterDto): BaseView {
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


    /**
     * 获取界面显示队列index
     * @param dto - 界面注册数据
     * @returns 
     */
    private getViewShowIndex(dto: ViewRegisterDto): number;
    /**
     * 获取界面显示队列index
     * @param cls - 界面类
     * @returns 
     */
    private getViewShowIndex(cls: unknown): number;
    /**
     * 获取界面显示队列index
     * @param id - 界面数字id
     * @returns 
     */
    private getViewShowIndex(id: number): number;
    /**
     * 获取界面显示队列index
     * @param viewName - 界面字符串id
     * @returns 
     */
    private getViewShowIndex(viewName: string): number;
    private getViewShowIndex(v: unknown) {
        if (typeof v == "number" || typeof v == "string") {
            return this.getViewShowIndexByViewID(v);
        } else if (typeof v == "function") {
            let className = this.getViewClassName(v);
            return this.getViewShowIndexByViewName(className);
        } else if (typeof v == "object") {
            let id = (v as ViewRegisterDto).id;
            this.getViewShowIndexByViewID(id);
        }
        return -1;
    }


    private getViewShowIndexByViewName(viewName: string): number {
        for (let i = this.viewOpenedArray.length - 1; i >= 0; i--) {
            let view = this.viewOpenedArray[i];
            let name = this.getViewClassName(view.viewCls);
            if (viewName == name) return i;
        }
        return -1;
    }


    private getViewShowIndexByViewID(id: number | string): number {
        for (let i = this.viewOpenedArray.length - 1; i >= 0; i--) {
            let view = this.viewOpenedArray[i];
            if (view.id == id) return i;
        }
        return -1;
    }


    /**
     * 获取界面显示对象
     * @template T extends BaseView = BaseView - 
     * @param cls - 界面类
     * @returns 
     */
    public getView<T extends BaseView = BaseView>(cls: unknown): T;
    /**
     * 获取界面显示对象
     * @template T extends BaseView = BaseView - 
     * @param id - 界面数字id
     * @returns 
     */
    public getView<T extends BaseView = BaseView>(id: number): T;
    /**
     * 获取界面显示对象
     * @template T extends BaseView = BaseView - 
     * @param viewName - 界面字符串id
     * @returns 
     */
    public getView<T extends BaseView = BaseView>(viewName: string): T;
    public getView<T extends BaseView = BaseView>(v: unknown): T {
        let index = this.getViewShowIndex(v);
        if (index < 0) return null;
        let register = this.viewOpenedArray[index];
        return this.getViewNode(register) as T;
    }


    // class end
}

export const viewManager = ViewManager.instance;
window["viewManager"] = viewManager;
