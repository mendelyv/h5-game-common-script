import RedRegisterDto from "./RedRegisterDto";


/** 红点注册基础数据 */
const registeredReds: RedRegisterDto[] = [];

export function registerRed(dto: RedRegisterDto) {
    dto.value = false;
    registeredReds.push(dto);
}

export function getRegisteredReds() {
    return registeredReds;
}
