import { LayerType } from "./LayerManager";

/**
 * @class: ViewRegisterDto
 * @description: 视图注册数据
 * @author: Ran
 * @time: 2024-08-13 14:19:35
 */
export default class ViewRegisterDto {
    /** 界面id，数字界面id或者字符串界面id，缺省类名字符串id */
    public id?: number | string;
    /** 父级id，缺省则挂到root下 */
    public parent?: number | string;
    /** 界面类 */
    public viewCls: unknown;
    /** 界面层级 */
    public layer: LayerType;
    /** 预制体路径前缀，缺省常量 */
    public prefabPathPrefix?: string;
    /** 预制体名称，需要带上除前缀路径外的路径，缺省类名 */
    public prefabName?: string;
}
