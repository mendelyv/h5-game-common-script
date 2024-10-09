/**
 * @class: RandomNumberPlugin
 * @description: roll数字效果插件
 * @author: Ran
 * @time: 2024-09-12 17:12:33
 */
export class RandomNumberPlugin {


    public time: number = 500;


    protected _label: Laya.Label;


    // ===== auxiliaries =====
    protected _startValue: number;
    protected _endValue: number;
    protected _currentValue: number;
    protected _changePerFrame: number;
    protected _timer: number;
    protected _formatted: string = "%d";
    protected _zeroVisible: boolean = true;
    // ===== auxiliaries =====


    public setLabel(label: Laya.Label): void {
        this._label = label;
    }


    public setFormatted(formatted: string): void {
        this._formatted = formatted;
    }


    public setZeroVisible(visible: boolean): void {
        this._zeroVisible = visible;
    }


    public roll(startValue: number, endValue: number): void {
        this._startValue = startValue;
        this._endValue = endValue;
        this._prepare();
        this._timer = 0;
        if (!Laya.timer.hasTimer(this, this._onUpdate))
            Laya.timer.frameLoop(1, this, this._onUpdate);
    }


    public rollTo(endValue: number): void {
        this._endValue = endValue;
        this._prepare();
        this._timer = 0;
        if (!Laya.timer.hasTimer(this, this._onUpdate))
            Laya.timer.frameLoop(1, this, this._onUpdate);
    }


    public rollImmediate(value: number): void {
        this.rollTo(value);
        this._onComplete();
    }


    protected _prepare(): void {
        this._label.visible = true;
        if (this._startValue == null) this._startValue = 0;
        let offset = this._endValue - this._startValue;
        this._changePerFrame = offset / (this.time - 50);
    }


    protected _onUpdate(): void {
        let delta = Laya.timer.delta;
        this._timer += delta;
        if (this._timer >= this.time) {
            this._onComplete();
            return;
        }
        this._currentValue = Math.max(this._startValue + Math.floor(this._timer * this._changePerFrame), 0);
        let over = mgr.toolsMgr.overLength(this._currentValue);
        let newString = this._formatted.replace("%d", over);
        this._label.text = newString;
    }


    protected _onComplete(): void {
        Laya.timer.clearAll(this);
        if (this._currentValue <= 0) this._label.visible = this._zeroVisible;
        if (this._label.visible) {
            let over = mgr.toolsMgr.overLength(this._endValue);
            let newString = this._formatted.replace("%d", over);
            this._label.text = newString;
        }
        this._startValue = this._endValue;
    }


    public destroy(): void {
        Laya.timer.clearAll(this);
        this._label = null;
    }


    // class end
}
