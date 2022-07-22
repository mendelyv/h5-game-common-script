
const { ccclass, property } = cc._decorator;

@ccclass
export default class Drag extends cc.Component {

    /** 原始父节点，用于拖拽时需要切换父节点 */
    protected _parentNode: cc.Node = null;
    /** 点击位置偏移 */
    protected _touchOffset: cc.Vec2;

    onLoad() {
        this._touchOffset = cc.Vec2.ZERO;
    }


    start() {
        this.node.on("touchstart", this.onTouchStart, this);
        this.node.on("touchmove", this.onTouchMove, this);
        this.node.on("touchend", this.onTouchEnd, this);
        this.node.on("touchcancel", this.onTouchEnd, this);

        this._parentNode = this.node.parent;
    }


    private onTouchStart(e: cc.Event.EventTouch) {
        let pos = this._parentNode.convertToNodeSpaceAR(e.touch.getLocation());
        this._touchOffset.x = pos.x - this.node.x;
        this._touchOffset.y = pos.y - this.node.y;
        pos.x -= this._touchOffset.x;
        pos.y -= this._touchOffset.y;
        this.node.setPosition(pos);
    }


    private onTouchMove(e: cc.Event.EventTouch) {
        let pos = this._parentNode.convertToNodeSpaceAR(e.touch.getLocation());
        pos.x -= this._touchOffset.x;
        pos.y -= this._touchOffset.y;
        this.node.setPosition(pos);
    }


    private onTouchEnd(e: cc.Event.EventTouch) {
        let pos = this._parentNode.convertToNodeSpaceAR(e.touch.getLocation());
        pos.x -= this._touchOffset.x;
        pos.y -= this._touchOffset.y;
        this.node.setPosition(pos);
        this._touchOffset = cc.Vec2.ZERO;
    }



}
