import { assetManager } from "./AssetManager";
import ContainerManager from "./ContainerManager";

/**
 * @class name : ViewManager
 * @description : 界面管理
 * @author : Ran
 * @time : 2022.07.19
 */
class ViewManager {
    private static _instance: ViewManager;

    public static get instance(): ViewManager {
        this._instance || (this._instance = new ViewManager());
        return this._instance;
    }

    private viewNodes: { [key: string]: cc.Node } = {};
    private viewOpenedArray: string[] = [];

    /**
     * 打开界面
     * @param cls - 界面类
     * @param params - 开启参数
     * @returns 界面节点
     */
    public async open(cls: Function | string, params?: any) {
        // prefabName = className.match(/.+?(?=[vV]iew)/)[0];
        /** 界面控制类名 */
        let className = this.getViewClassName(cls);
        if (!className || className === "") return;

        let index = this.getViewShowIndex(className);
        if (index > -1) return this.resume(cls, params);

        /** 界面预制体名称 */
        let prefabName = cls["prefabName"];
        if (!prefabName) prefabName = className;

        // 获取之前的节点存储，注意这里的kye值为类名
        let node = this.viewNodes[className];
        if (!node) {
            node = await assetManager.createPrefab(prefabName) as cc.Node;
            if (!node) {
                console.error(`open ${className} failed ${prefabName} is not exist`);
                return;
            }
            node.name = className;
            this.viewNodes[className] = node;
            this.analyzeViewScript(node, className);
        }

        //获取到前一个页面
        let preViewName = this.viewOpenedArray[this.viewOpenedArray.length - 1];
        if(preViewName) {
            let preView = this.getViewNode(preViewName);
            if(preView) {
                let preScript = this.getViewScript(preViewName);
                if(preScript) {
                    if(preScript["onHide"])
                        preScript["onHide"]();
                }
            } else {
                console.warn(`${preViewName} is not show, but viewOpenedArray has save, check it`);
            }
        }

        // 添加到父节点
        let viewContainer = this.getViewContainer(cls);
        if(!viewContainer) return;
        viewContainer.addChild(node);
        this.viewOpenedArray.push(className);

        // 调用界面控制脚本
        let viewController = this.getViewScript(cls);
        if (viewController) {
            if (viewController["onOpen"])
                viewController["onOpen"](params);
        } else {
            // console.warn(`${prefabName} has not view controller`);
        }

        return node;
    }


    /**
     * 恢复界面
     * @param cls - 界面类
     * @returns 界面节点
     */
    public resume(cls: Function | string, params?: any) {
        let className = this.getViewClassName(cls);
        let index = this.getViewShowIndex(className);
        if (index <= -1) {
            console.warn(`${className} is not show`);
            return null;
        }
        let node = this.viewNodes[className];
        let container = node.parent;
        if (!container) {
            console.warn(`${className} is not show`);
            return null;
        }
        if (node.getSiblingIndex() === container.children.length - 1) {
            console.warn(`${className} is already top show`);
            return node;
        }
        node.setSiblingIndex(container.children.length - 1);

        let temp = this.viewOpenedArray.splice(index, 1)[0];
        this.viewOpenedArray.push(temp);

        let script = this.getViewScript(cls);
        if (script) {
            if (script["onResume"])
                script["onResume"](params);
        } else {
            // console.warn(`${className} has not view controller`);
        }
        return node;
    }


    private analyzeViewScript(node: cc.Node, scriptName: string) {
        let has = node.getComponent(scriptName) != null;
        if (!has) node.addComponent(scriptName);
    }


    /**
     * 关闭界面
     * @param cls - 界面类
     * @param params - 关闭参数
     * @returns 界面节点
     */
    public close(cls: Function | string, params?: any) {
        let className = cc.js.getClassName(cls);
        let node = this.viewNodes[className];
        if (!node) return;
        this.removeFromParent(node);
        this.viewOpenedArray.splice(this.viewOpenedArray.indexOf(className), 1);
        let script = this.getViewScript(cls);
        if(script) {
            if(script["onClose"])
                script["onClose"](params);
        } else {
            // console.warn(`${className} has not view controller`);
        }
        return node;
    }


    /**
     * 销毁界面
     * @param cls - 界面类
     */
    public destory(cls: Function | string) {
        this.close(cls);
        let className = this.getViewClassName(cls);
        delete this.viewNodes[className];
    }


    private removeFromParent(node: cc.Node) {
        if (!node || !node.parent) return;
        node.parent.removeChild(node);
    }


    private getViewNode(cls: Function | string) {
        let className = this.getViewClassName(cls);
        return this.viewNodes[className] || null;
    }


    private getViewScript(cls: Function | string) {
        let className = this.getViewClassName(cls);
        let node = this.viewNodes[className];
        if (!node) {
            console.error(`getViewController ${className} is not exist`);
            return null;
        }

        return node.getComponent(className);
    }


    /**
     * 获取界面类名
     * @param cls - 界面类
     * @returns 界面类名称字符串
     */
    private getViewClassName(cls: Function | string) {
        let className = "";
        if (typeof cls === "string") className = cls;
        else if (typeof cls === "function") className = cc.js.getClassName(cls);
        else
            console.error("ViewManager.getViewClassName: cls is not string or function");
        return className;
    }


    private getViewShowIndex(cls: Function | string) {
        let className = this.getViewClassName(cls);
        return this.viewOpenedArray.indexOf(className);
    }


    private getViewContainer(cls: Function | string) {
        let className = this.getViewClassName(cls);
        if (cls === "string") cls = cc.js.getClassByName(cls);
        let containerType = cls["LAYER"];
        let viewContainer = ContainerManager.getContainer(containerType);
        if (!viewContainer)
            viewContainer = cls["getContainer"] != null ? cls["getContainer"]() : null;
        if (!viewContainer) {
            console.error(`open ${className} field container is null`)
        }
        return viewContainer;
    }
}
export const viewManager = ViewManager.instance;
window["viewManager"] = viewManager;
