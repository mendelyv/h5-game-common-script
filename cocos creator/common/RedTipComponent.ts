import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import menu = cc._decorator.menu;
import {redTipManager} from "./RedTipManager";

const red_dot = "_red_dot";
enum eRedType {
    common = 1,
    other
}
@ccclass()
@menu("自定义组件/RedTipComponent")
export class RedTipComponent extends cc.Component {

    @property({ type: cc.Enum(eRedType), serializable: true, displayName: "红点类型", tooltip: "默认" })
    private type: eRedType = eRedType.common;

    @property({ type: cc.Integer, displayName: "点击n次消失", tooltip: "0 不消失" })
    private touchcount: number = 0;

    @property({ displayName: "红点父节点路径", tooltip: "节点层级往下查找：\n/: 右斜杠，代表1级子节点（与cc.find相同）\n >: 大于符号，表示1~n级子节点 \n 如： HomeWindow/Tab>Fight" })
    key: string = "";

    @property({ type: cc.Node, displayName: "红点" })
    private redSprite: cc.Node = null;

    @property({ type: cc.Label, displayName: "红点数量" })
    private redCount: cc.Label = null;

    private compareFn: (key: string) => number;
    private changeFn: (key: string) => void;
    private refresh_time: number = redTipManager.REFRESH_TIME;
    onLoad() {
        if (this.key.length <= 0) {
            return;
        }
        if (!this.redSprite) {
            return;
        }
        // 添加
        redTipManager.register(this.key, this);

        if (this.touchcount > 0) {
            this.node.on(cc.Node.EventType.TOUCH_END, (event: cc.Event) => {
                redTipManager.addReadCount(this.key, 1);
            }, this);
        }

        this.redSprite.active = false;
    }
    private setRedCount(num: number) {
        if (this.redCount) {
            num = Math.max(1, num);
            num = Math.min(99, num);
            this.redCount.string = num.toString();
        }
    }
    public isRed() {
        return this.redSprite.active;
    }
    // 刷新
    public updateRed() {
        let old = this.redSprite.active;
        let isred = false;
        // 自定义判断
        if (this.touchcount !=1) {
            if (this.compareFn) {
                let ret = this.compareFn(this.key);
                this.setRedCount(ret);
                isred = ret > 0 ? true : false;
            } else {
                this.redSprite.active = false;
            }

            // 点击次数
            let count = Math.max(1, this.touchcount);
            if (redTipManager.getReadCount(this.key) >= count) {
                isred = false;
            }
            this.redSprite.active = isred;
            // 红点状态变化回调
            if (!this.changeFn) {
                return;
            }
            if (old == this.redSprite.active) {
                return;
            }
        }else{
            // 点击次数
            let count = Math.max(1, this.touchcount);
            if (redTipManager.getReadCount(this.key) >= count) {
                isred = false;
            }else{
                isred = true;
            }
            this.redSprite.active = isred;
            // 红点状态变化回调
            if (!this.changeFn) {
                return;
            }
        }

        this.changeFn(this.key)
    }

    private dt = 0;
    update(dt) {
        if (this.refresh_time > 60) {
            return;
        }
        this.dt += dt;
        if (this.dt > this.refresh_time) {
            this.dt = 0;
            this.fixUpdate();
        }
    }
    private fixUpdate() {
        this.updateRed();
    }

    /**
     * 设置检测方法
     * @param compareFn 
     * @param change 
     */
    public notify(compareFn: (key: string) => number, change: (key: string) => void = undefined) {
        this.compareFn = compareFn;
        this.changeFn = change;
    }

    /**
     * 设置刷新时间
     * @param delay  >60 不自动刷新
     */
    public setUpdateTime(delay: number) {
        this.refresh_time = delay;
    }

    public onDestroy() {
        // 移除
        redTipManager.unregister(this.key);
        this.compareFn = undefined;
        this.changeFn = undefined;
    }
}