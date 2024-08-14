import ViewRegisterDto from "./ViewRegisterDto";


/** 界面注册基础数据 */
const registeredViews: ViewRegisterDto[] = [];
export function register(dto: ViewRegisterDto) {
    if (dto.id == null) {
        dto.id = cc.js.getClassName(dto.viewCls);
    }
    registeredViews.push(dto);
}
export function getRegisteredViews() {
    return registeredViews;
}


export default class ViewConst {
    /** 默认预制体路径 */
    public static defaultPrefabPathPrefix = "resources://prefabs/";
}
