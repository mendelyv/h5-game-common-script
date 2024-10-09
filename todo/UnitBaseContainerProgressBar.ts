export interface IUnitBaseContainerProgressBar {
    /** 背景图 */
    imgBg?: Laya.Image;
    /** 进度条图片 */
    imgProgress: Laya.Image;
    /** 进度条文本 */
    lblProgress?: Laya.Label;
}

/**
 * @class: UnitBaseContainerProgressBar
 * @description: 容器进度条基类
 * @author: Ran
 * @time: 2024-08-06 14:16:00
 */
export class UnitBaseContainerProgressBar<T extends Laya.View & IUnitBaseContainerProgressBar> extends sg.ViewBaseWithContainer<T> {


    protected _progressMask: Laya.Sprite;
    /** 遮罩在方向上的尺寸 */
    protected _progressMaskDirectionSize: number;


    public type: UnitProgressBarType = UnitProgressBarType.mask;
    public direction: UnitProgressBarDirection = UnitProgressBarDirection.right;
    public showLabel: boolean = true;
    protected _value: number = 0;
    protected _max: number = 1;


    public get max(): number {
        return this._max;
    }


    public set max(v: number) {
        this._max = v;
    }


    public get value(): number {
        return Math.min(this._value, this._max);
    }


    public set value(v: number) {
        this._value = v;
        this._updateProgress();
        this._updateLabel();
    }


    public setProgressImage(value: string): void {
        this.container.imgProgress.skin = value;
    }
    public setLabel(value: string): void {
        if (this._container.lblProgress == null)
            return;
        this._container.lblProgress.text = value;
    }

    /**
     * 设置进度条填充图片布局
     * @param layout - 
     */
    public setProgressLayout(layout: { left?: number, top?: number, right?: number, bottom?: number }): void {
        if (layout.left != null) this.container.imgProgress.left = layout.left;
        if (layout.right != null) this.container.imgProgress.right = layout.right;
        if (layout.top != null) this.container.imgProgress.top = layout.top;
        if (layout.bottom != null) this.container.imgProgress.bottom = layout.bottom;
    }


    protected _updateProgress(): void {
        if (this.type == UnitProgressBarType.NONE) return;
        if (this.direction == UnitProgressBarDirection.NONE) return;
        switch (this.type) {
            case UnitProgressBarType.size: this._updateProgressBySize(); break;
            case UnitProgressBarType.mask: this._updateProgressByMask(); break;
            default: break;
        }
    }


    protected _updateProgressBySize(): void {
        let size = 0;
        switch (this.direction) {
            case UnitProgressBarDirection.right: {
                size = this.container.width * this.value / this._max;
                this.container.imgProgress.width = size;
            } break;
        }
    }


    protected _updateProgressByMask(): void {
        if (this._progressMask != null) {
            this.container.imgProgress.mask = null;
            this._progressMask.graphics.clear();
            this._progressMask.destroy();
        }
        this._progressMask = new Laya.Sprite();

        switch (this.direction) {
            case UnitProgressBarDirection.up: {
                this._progressMaskDirectionSize = this.container.height * this.value / this._max;
                this._progressMask.graphics.drawRect(0, this.container.height - this._progressMaskDirectionSize, this.container.width, this._progressMaskDirectionSize, "#000000");
            } break;

            case UnitProgressBarDirection.right: {
                this._progressMaskDirectionSize = this.container.width * this.value / this._max;
                this._progressMask.graphics.drawRect(0, 0, this._progressMaskDirectionSize, this.container.height, "#000000");
            } break;
        }

        this.container.imgProgress.mask = this._progressMask;
    }


    protected _updateLabel(): void {
        if (this.container.lblProgress == null) return;
        this.container.lblProgress.visible = this.showLabel;
        if (this.showLabel) {
            this.container.lblProgress.text = this.value + "/" + this._max;
        }
    }


    onDestroy(): void {
        if (this._progressMask != null) {
            this._progressMask.destroy();
            this._progressMask = null;
        }
        super.onDestroy();
    }


    // class end
}
