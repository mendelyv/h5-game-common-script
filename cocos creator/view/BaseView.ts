import { ContainerType } from "../../common/ContainerManager";

const {ccclass} = cc._decorator;

/**
 * @class name : BaseView
 * @description : 基础界面
 * @author : Ran
 * @time : 2022.07.19
 */
@ccclass
export default class BaseView extends cc.Component {
    public static LAYER: ContainerType;
    public static prefabName: string;
    public prefabName: string;
    public onOpen(params?: any) {}
    public onResume(params?: any) {}
    public onHide(param?: any) {}
    public onClose(params?: any) {}
    public onDestory() {}
    public static getContainer(): cc.Node { return null; }
}
