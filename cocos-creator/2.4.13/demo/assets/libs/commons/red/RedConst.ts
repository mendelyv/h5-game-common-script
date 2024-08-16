import RedRegisterDto from "./RedRegisterDto";
import { RedType } from "./RedType";


/** 红点注册基础数据 */
const registeredReds: RedRegisterDto[] = [];

export function registerRed(dto: RedRegisterDto) {
    dto.value = false;
    registeredReds.push(dto);
}

export function registerReds(parent: RedType, types: RedType[]) {
    for (let i = 0; i < types.length; i++) {
        let dto = new RedRegisterDto();
        dto.type = types[i];
        dto.parent = parent;
        registerRed(dto);
    }
}

export function getRegisteredReds() {
    return registeredReds;
}
