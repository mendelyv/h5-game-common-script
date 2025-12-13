export interface IMultiProgressContainerUI {
    $img_bg?: fgui.GLoader;
    $progress_0: UIComInstance & IProgressContainerUI;
    $progress_1: UIComInstance & IProgressContainerUI;
    $lb_progress?: fgui.GTextField;
}

export default class MultiProgressContainer {
    protected _content: unknown;

    /** 当前片段 */
    protected _currentSegment: number;
    protected _currentProgressIndex: number;
    /** 进度条图片索引 */
    protected _resourceIndex: number;

    protected _gp_progress: fgui.GComponent;
    protected _progresses: ProgressContainer[];
    protected _resources: string[];

    protected _valueIncreaseDirection: number = 0;
    protected _valueIncreaseSpeed: number = 0;
    protected _targetValue: number = 0;
    protected _value: number;
    protected _single: number;

    public set value(value: number) {
        let k = Math.floor(value / this._single);
        let v = value - k * this._single;
        if (k !== this._currentSegment) {
            this._switchProgress();
            this._currentSegment = k;
        }
        this._value = value;
        this._progresses[this._currentProgressIndex].value = v;
        let other = this._progresses.length - this._currentProgressIndex - 1;
        this._progresses[other].value = k > 0 ? this._single : 0;
    }

    public get value() {
        return this._value;
    }

    public set single(value: number) {
        this._single = value;
        for (let i = 0; i < this._progresses.length; i++) {
            this._progresses[i].max = value;
        }
    }

    public constructor(c: UIComInstance & IMultiProgressContainerUI) {
        this._content = c;
        this._value = 0;
        this._single = 1;
        let gpInsertIndex = c.getChildIndex(c.$progress_0);
        this._progresses = [new ProgressContainer(c.$progress_0), new ProgressContainer(c.$progress_1)];
        this.updateResources([]);
        this._gp_progress = new fgui.GComponent();
        this._gp_progress.addChild(c.$progress_0);
        this._gp_progress.addChild(c.$progress_1);
        c.addChildAt(this._gp_progress, gpInsertIndex);
        this._currentProgressIndex = this._progresses.length - 1;
        this._currentSegment = 0;
    }

    protected _getProgressImageURL() {
        this._resourceIndex++;
        let index = this._resourceIndex % this._resources.length;
        return this._resources[index];
    }

    protected _switchProgress() {
        let other = this._progresses.length - this._currentProgressIndex - 1;
        this._currentProgressIndex = other;
        let c = this._gp_progress;
        let currentProgress = this._progresses[this._currentProgressIndex];
        let resource = this._getProgressImageURL();
        if (null != resource) currentProgress.setProgressImage(resource);
        c.setChildIndex(currentProgress.content as UIComInstance, c.numChildren - 1);
    }

    public updateResources(urls: string[]) {
        this._resources = urls;
        for (let i = 0; i < this._progresses.length; i++) {
            let progress = this._progresses[i];
            let rIndex = i > this._resources.length - 1 ? this._resources.length - 1 : i;
            let resource = this._resources[rIndex];
            if (null != resource) progress.setProgressImage(resource);
            let ui = progress.content as IProgressContainerUI;
            progress.updateProgressMaxSize(ui.$img_progress.width);
            this._resourceIndex = rIndex;
        }
    }

    public updateValue(value: number, time?: number) {
        if (null != time) {
            this._targetValue = value;
            let offset = value - this._value;
            this._valueIncreaseDirection = offset > 0 ? 1 : -1;
            this._valueIncreaseSpeed = offset / time;
            this._turnUpdate(true);
        } else {
            this.value = value;
        }
    }

    public update() {
        let dt = Laya.timer.delta;
        this.value = this._value + this._valueIncreaseSpeed * dt;
        this._updateLimit();
    }

    protected _updateLimit() {
        if (this._valueIncreaseDirection * (this._value - this._targetValue) >= 0) {
            this.value = this._targetValue;
            this._turnUpdate(false);
        }
    }

    protected _turnUpdate(on: boolean) {
        if (on) Laya.timer.frameLoop(1, this, this.update);
        else Laya.timer.clear(this, this.update);
    }

    public destroy() {
        this._turnUpdate(false);
        this._gp_progress.removeFromParent();
        this._gp_progress = null;
        this._progresses = null;
        this._content = null;
    }

    // class MultiProgressContainer end
}
