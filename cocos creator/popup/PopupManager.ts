import { PopupBase } from "./PopupBase";

export class PopupManager {

    private static _instance: PopupManager;
    public static get instance() {
        if (null == this._instance) {
            this._instance = new PopupManager();
        }
        return this._instance;
    }

    private popupNode: cc.Node | null = null;
    // private blockInputNode: cc.Node | null = null; // 可选
    private popups: Array<string>;
    private nodes: Map<string, cc.Node>;
    private paths: Map<string, string>;
    private popupInit: boolean = false;

    private constructor() {
        this.popups = new Array();
        this.nodes = new Map();
        this.paths = new Map();
    }

    init() {
        this.setParent();
    }

    preLoad(option: { name?: string, prefab?: cc.Prefab, url?: string }) {
        let name = option.name || option.prefab?.name || this.getNameByPath(option.url);
        if (null != name && null != this.nodes.get(name)) {
            console.warn(`${name}已经预加载了`);
            return;
        }
        if (null != option.prefab) {
            let node = cc.instantiate(option.prefab);
            this.nodes.set(name, node);
            return;
        }
        if (null != option.url) {
            PopupManager.load({
                paths: option.url,
                type: cc.Prefab,
                onComplete: (err: Error | null, prefab: cc.Prefab) => {
                    if (err) {
                        console.error(`${option.url}加载失败`);
                        return;
                    }
                    this.setNameByPath(option.url!, prefab.name);
                    if (null == name) {
                        name = prefab.name;
                    }
                    let node = cc.instantiate(prefab);
                    this.nodes.set(name, node);
                }
            });
        }
    }
    /**
     * 打开弹窗+
     * @param option -预制件信息
     * @param name:预制件名称
     * @param prefab:预制件
     * @param path:路径
     * @param priority:层级zIndex
     * @param params:Data数据
     * @param keep:隐藏or开启
     * @returns 
     */
    show(option: { name?: string, prefab?: cc.Prefab, path?: string, priority?: number, params?: any, keep?: boolean }) {
        if (!this.popupInit) {
            throw new Error('请先初始化UIManager');
        }
        // 如果需要一个prefab对应两个弹框，则名字需要自行定义
        let name = option.name || option.prefab?.name || this.getNameByPath(option.path);
        if (null == name && null == option.path) {
            throw new Error('name、prefab、path不同同时为空');
        }
        // TODO 弹框过程中，背景不可以点击
        // this.blockInputNode!.active = true;
        let priority = option.priority || 0;
        let node: cc.Node | undefined;
        if (null != name) {
            node = this.nodes.get(name);
        }
        if (null == node) {
            if (null == option.prefab) {
                if (null == option.path) {
                    throw new Error('首次创建必须传入prefab或者path');
                }
                PopupManager.load({
                    paths: option.path,
                    type: cc.Prefab,
                    onComplete: (err: Error | null, prefab: cc.Prefab) => {
                        if (err) {
                            console.error(`${option.path}加载失败`);
                            return;
                        }
                        this.setNameByPath(option.path!, prefab.name);
                        if (null == name) {
                            name = prefab.name;
                        }
                        node = cc.instantiate(prefab);
                        this.nodes.set(name, node);
                        this._show(name, node, priority, option.params, option.keep || false);
                    }
                });
                return;
            }
            node = cc.instantiate(option.prefab);
            this.nodes.set(name, node);
            this._show(name, node, priority, option.params, option.keep || false);
        } else {
            this._show(name, node, priority, option.params, option.keep || false);
        }
    }

    private _show(name: string, node: cc.Node, priority: number, params: any, keep: boolean) {
        // 层级高的优先显示
        let curPriority = this.getCurrentPopup()?.zIndex || 0;
        if (priority < curPriority) {
            node.active = false;
            for (let i = 0; i <= this.popups.length - 1; i++) {
                let tempNode = this.nodes.get(this.popups[i]);
                if (priority <= (tempNode!.zIndex || 0)) {
                    this.popups.splice(i, 0, name);
                    break;
                }
            }
        } else if (!keep) {
            this._hideAll();
            let idx = this.popups.indexOf(name);
            if (idx >= 0) {
                this.popups.splice(idx, 1);
            }
            this.popups.push(name);
        }
        let popup = node.getComponent(PopupBase);
        if (null == popup) {
            throw new Error('请将Popup继承PopupBase');
        }
        popup._init(name, params);
        if (node.parent != this.popupNode) {
            node.removeFromParent();
            node.parent = this.popupNode;
        }
        if (node.zIndex != priority) {
            node.zIndex = priority;
        }
        if (priority >= curPriority) {
            popup!._show();
        }
    }

    private showLast() {
        let node: cc.Node | null = null;
        if (this.popups.length > 0) {
            let name = this.popups[this.popups.length - 1];
            node = this.nodes.get(name) || null;
        }
        if (null == node) {
            // this.blockInputNode!.active = false;
            return;
        }
        if (!node.active) {
            let ui = node.getComponent(PopupBase)!;
            ui._show();
        }
    }

    hide(name: string) {
        let idx = this.popups.indexOf(name);
        let isLast = idx === this.popups.length - 1;
        if (idx >= 0) {
            this.popups.splice(idx, 1);
        }
        this._hideUI(name);
        if (isLast) {
            this.showLast();
        }
    }

    hideAll() {
        this._hideAll();
        this.popups.length = 0;
    }

    _hideAll() {
        for (let i = 0; i < this.popups.length; i++) {
            this._hideUI(this.popups[i]);
        }
        // this.blockInputNode!.active = false;
    }

    private _hideUI(name: string) {
        let node = this.nodes.get(name);
        if (null == node) {
            console.warn(`${name}已被销毁`);
            return;
        }
        let ui = node.getComponent(PopupBase);
        ui!._hide();
    }

    remove(name: string) {
        this.hide(name);
        let node = this.nodes.get(name);
        if (null == node) {
            return;
        }
        this.nodes.delete(name);
        let ui = node.getComponent(PopupBase);
        ui!._remove();
    }

    removeAll() {
        this.hideAll();
        for (let name in this.nodes) {
            this.remove(name);
        }
        // this.blockInputNode!.active = false;
    }

    getCurrentPopup() {
        let name = this.getCurrentName();
        if (null == name) {
            return null;
        }
        return this.nodes.get(name);
    }

    getCurrentName(): string | null {
        if (this.popups.length > 0) {
            return this.popups[this.popups.length - 1];
        }
        return null;
    }

    getPopup(name: string): cc.Node | null {
        return this.nodes.get(name) || null;
    }

    private setNameByPath(path: string, name: string) {
        if (null == this.getNameByPath(path)) {
            this.paths.set(path, name);
        }
    }

    private getNameByPath(path: string | null | undefined): string | null | undefined {
        if (null == path) {
            return null;
        }
        return this.paths.get(path);
    }


    private setParent() {
        if (this.popupInit) {
            throw new Error('PopupManager已经初始化了');
        }
        this.popupNode = new cc.Node('Popup');
        cc.director.getScene()?.addChild(this.popupNode);
        cc.game.addPersistRootNode(this.popupNode);
        let size = cc.view.getVisibleSize();
        this.popupNode.zIndex = 99;
        this.popupNode.setContentSize(size);
        this.popupNode.x = size.width / 2;
        this.popupNode.y = size.height / 2;
        this.popupInit = true;

        // TODO 实现弹框过程中，背景不可以点击
        // this.blockInputNode = new Node('blockInputNode');
        // this.blockInputNode.parent = this.popupNode;
        // let blockInputTransform = this.blockInputNode.addComponent(UITransform);
        // blockInputTransform.contentSize = size;
        // blockInputTransform.priority = -1;
        // this.blockInputNode!.active = false;
    }
    public static load(option: {
        paths: string,
        type: typeof cc.Asset | null,
        onProgress?: any,
        onComplete?: any
    }): void {
        cc.resources.load(option.paths, option.type, option.onProgress!, option.onComplete!);
    }
}

