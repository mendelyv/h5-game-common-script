import Utils from "./Utils";
const { ccclass } = cc._decorator;

type IEventCallBackFunction = (data: any) => void;

@ccclass
class EventManager {
    private static _instance: EventManager;

    public static get getInstance(): EventManager {
        this._instance || (this._instance = new EventManager());
        return this._instance;
    }
    private _eventMap = {};  //对象对应的所有事件
    private _typeMap = {};	//事件对于的所有对象

    /**
     * 派发事件
     * @param evt 事件名(GameEvent 类中定义的事件名)
     * @param data  附带数据
     */
    public dispatch(evt: number | string, data: any = null): void {
        let t = this;
        let typeInfo = t._typeMap[evt];//获取map里面所有对应事件的回调并执行
        if (typeInfo) {
            for (let key in typeInfo) {//遍历对应事件的map查找所有被注册的事件并执行
                let funcInfo = typeInfo[key];
                if (funcInfo && funcInfo.func) {
                    funcInfo.func.call(funcInfo.funObj, data);
                }
            }
        }
    }

    /**
     * 添加事件
     * @param type - 事件类型
     * @param func - 响应函数
     * @param funObj - 响应对象
     */
    public addEvent(type: number | string, func: Function, funObj: cc.Node | cc.Component): void {
        let eventMap = this._eventMap;
        let typeMap = this._typeMap;

        let hashCode = Utils.getHashCode(funObj);//获取对象的唯一id
        let key = hashCode;

        //添加事件处理
        let funInfo = { func: func, funObj: funObj };

        if (!eventMap[key]) eventMap[key] = {};
        eventMap[key][type] = funInfo;//生成对象，事件map，便于统一删除管理

        if (!typeMap[type]) typeMap[type] = {};//生成事件，对象map方便广播遍历处理
        typeMap[type][key] = funInfo;
    }

    /**
     * 删除事件
     * @param type - 事件类型
     * @param func - 响应函数
     * @param funObj - 响应对象
     */
    public removeEvent(type: number | string, func: Function, funObj: cc.Node | cc.Component): void {
        if (!funObj) return;
        let key = Utils.getHashCode(funObj);

        if (this._eventMap[key]) delete this._eventMap[key][type];
        if (this._typeMap[type]) delete this._typeMap[type][key];
    }

    /**
     * 删除所有事件
     * @param evtObj - 
     */
    public removeEvents(evtObj: cc.Node | cc.Component): void {
        let eventMap = this._eventMap;
        let keyV = Utils.getHashCode(evtObj);

        let evtDic = eventMap[keyV];
        if (evtDic) {
            for (let key in evtDic) {
                let funcInfo = evtDic[key];
                if (funcInfo) {
                    this.removeEvent(key, funcInfo.func, evtObj);
                }
            }
        }
        evtDic = null;
        delete this._eventMap[keyV];
    }
}



export const eventManager = EventManager.getInstance;
window["eventManager"] = EventManager;
