const {ccclass, property} = cc._decorator;

@ccclass
export default abstract class ScrollViewRender extends cc.Component {
    public dto: unknown;
    public abstract update(): void;
}
