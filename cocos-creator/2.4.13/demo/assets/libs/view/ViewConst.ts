import ViewRegisterDto from "./ViewRegisterDto";


/** 界面注册基础数据 */
const registeredViews: ViewRegisterDto[] = [];
/** 界面注册字典集，key为注册数据的id */
const registeredViewDictionary: { [key: number | string]: ViewRegisterDto } = {};
/** 界面注册字典集，key为注册数据的类名 */
const registeredviewDictionaryByName: { [className: string]: ViewRegisterDto } = {};

export function registerView(dto: ViewRegisterDto) {
    let className = cc.js.getClassName(dto.viewCls);
    if (dto.id == null) dto.id = className;
    registeredViews.push(dto);
    registeredViewDictionary[dto.id] = dto;
    registeredviewDictionaryByName[className] = dto;
}

/**
 * 获取所有注册的界面数据
 * @returns 
 */
export function getRegisteredViews() {
    return registeredViews;
}


/**
 * 获取界面注册数据
 * @param cls - 界面类
 * @returns 
 */
export function getViewRegisterDto(cls: unknown): ViewRegisterDto;
/**
 * 获取界面注册数据
 * @param viewName - 界面字符串id
 * @returns 
 */
export function getViewRegisterDto(viewName: string): ViewRegisterDto;
/**
 * 获取界面注册数据
 * @param id - 界面数字id
 * @returns 
 */
export function getViewRegisterDto(id: number): ViewRegisterDto;
export function getViewRegisterDto(v: unknown): ViewRegisterDto {
    let dto = null;
    if (typeof v == "number" || typeof v == "string") {
        dto = registeredViewDictionary[v];
        if (dto != null) return dto;
        dto = registeredviewDictionaryByName[v];
    } else if (typeof v == "function") {
        let className = cc.js.getClassName(v);
        dto = registeredviewDictionaryByName[className];
    }
    return dto;
}

export default class ViewConst {
    /** 默认预制体路径 */
    public static defaultPrefabPathPrefix = "resources://prefabs/";
}
