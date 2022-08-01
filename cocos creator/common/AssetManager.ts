
/**
 * @class name : AssetManager
 * @description : 资源管理类
 * @author : Ran
 * @time : 2022.07.20
 */
class AssetManager {
    private static _instance: AssetManager;

    public static get getInstance(): AssetManager {
        this._instance || (this._instance = new AssetManager());
        return this._instance;
    }


    /**
     * 获取bundle，如果未加载则加载该bundle
     * @param nameOrUrl - bundle路径
     * @returns bundle对象
     */
    public getBundle(nameOrUrl: string) {
        if (!nameOrUrl || nameOrUrl === "") return Promise.reject("ERROR Bundle name");
        const bundle = cc.assetManager.getBundle(nameOrUrl);
        if (bundle) { return Promise.resolve(bundle); }
        return new Promise<cc.AssetManager.Bundle>((resolve, reject) => {
            cc.assetManager.loadBundle(nameOrUrl, (err, bundle) => {
                if (err) {
                    console.error(`load bundle ${nameOrUrl} error: ${err}`);
                    reject(err);
                }

                resolve(bundle);
            });
        });
    }


    /**
     * 加载文件
     * @template T extends cc.Asset - 资源类型
     * @param path - 资源路径，规则为: bundleName://assetName，缺省bundleName为resources
     * @returns 资源对象
     */
    public async load<T extends cc.Asset>(path: string): Promise<T> {
        let { bundleName, assetName } = this.parseAssetPath(path);
        let bundle = await this.getBundle(bundleName);
        if (!bundle) return Promise.reject("ERROR Bundle");
        let asset = bundle.get(assetName);
        if (asset) return Promise.resolve(asset);
        return new Promise<T>((resolve, reject) => {
            bundle.load(assetName, (err, resource) => {
                if (err) {
                    console.error(`load asset ${path} error: ${err}`);
                    reject(err);
                }
                resolve(resource as T);
            });
        });
    }


    /**
     * 解析资源路径
     * @param path - 资源路径，规则为: bundleName://assetName，缺省bundleName为resources
     * @returns 资源路径中的bundleName和assetName
     */
    private parseAssetPath(path: string) {
        let bundleName: string, assetName: string;
        if (path.indexOf("://") <= 0) {
            bundleName = "resources";
            assetName = path;
        } else if (path.indexOf("/") <= 0) {
            bundleName = path;
            assetName = "";
        } else {
            let regexArr = path.match(/^(.+?):\/\/(.+?)\/(.+?)$/);
            bundleName = regexArr[1];
            assetName = regexArr[3];
        }
        return { bundleName, assetName };
    }


    /**
     * 释放资源
     * @param path - 资源路径，规则为: bundleName://assetName，缺省bundleName为resources
     * @param releaseBundle - 是否释放bundle，缺省为false
     */
    public release(path: string, releaseBundle: boolean = false) {
        let { bundleName, assetName } = this.parseAssetPath(path);
        let bundle = cc.assetManager.getBundle(bundleName);
        if (!bundle) return;
        if (!releaseBundle) {
            bundle.release(assetName);
        } else {
            this.releaseBundle(bundle);
        }
    }


    /**
     * 释放bundle
     * @param bundle - bundle名字或bundle对象
     */
    public releaseBundle(bundle: string | cc.AssetManager.Bundle) {
        if (typeof bundle === "string") {
            let b = cc.assetManager.getBundle(bundle);
            if (!b) return;
            b.releaseAll();
            cc.assetManager.removeBundle(b);
        } else {
            if (!bundle) return;
            bundle.releaseAll();
            cc.assetManager.removeBundle(bundle);
        }
    }


    /* 释放所有资源 */
    public releaseAll() {
        cc.assetManager.releaseAll();
    }


    /**
     * 创建预制体
     * @param prefabPath ：预制体路径，规则为: bundleName://assetName，缺省bundleName为resources
     */
    public async createPrefab(prefabPath: string): Promise<cc.Node> {
        let p = await this.load<cc.Prefab>(prefabPath);
        return cc.instantiate(p) as any;
    }


    /**
     * base64转纹理
     * @param data - base64编码的字符串
     * @returns 纹理
     */
    public async base64ToTexture(data: string) {
        return new Promise<any>((resolve, reject) => {
            let img = new Image();
            img.src = data;
            img.onload(() => {
                let texture = new cc.Texture2D();
                texture.initWithElement(img);
                texture.handleLoadedTexture();
                resolve(texture);
            })
        })
    }


    /**
     * base64转精灵
     * @param data - base64编码的字符串
     * @returns 精灵数据
     */
    public async base64ToSpriteFrame(data: string) {
        let texture = await this.base64ToTexture(data);
        return new cc.SpriteFrame(texture);
    }


}
export const assetManager = AssetManager.getInstance;
window["assetManager"] = assetManager;
