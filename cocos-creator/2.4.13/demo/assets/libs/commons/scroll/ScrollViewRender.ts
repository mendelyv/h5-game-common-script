import BaseComponent from "../BaseComponent";

const {ccclass, property} = cc._decorator;

@ccclass
export default abstract class ScrollViewRender extends BaseComponent {
    public dto: unknown;
    public abstract updateContent(): void;
}
