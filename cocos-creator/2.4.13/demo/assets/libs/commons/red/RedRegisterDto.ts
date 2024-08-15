import { RedType } from "./RedType";

export default class RedRegisterDto {
    type: RedType;
    parent?: RedType;
    value?: boolean;
}
