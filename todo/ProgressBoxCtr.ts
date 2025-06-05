import { UIItem } from "./Item/UIItem";

export enum ProgressBoxStatus {
    Common,
    CanGet,
    Received
}

export class ProgressBoxVo {
    public score: number;
}

/**
 * @author zhangqiong
 * @class ProgressBoxCtr
 * @time 2025-02-24 11:51:50
 * @description 
 */
export class ProgressBoxCtr<V extends ProgressBoxVo, T extends UIItem<V>> {

    private _container: fgui.GComponent;
    private _progress: fgui.GProgressBar;
    private _boxItemInstanceHandler: () => T;

    private _boxItemMap: { [key: number]: T };

    private _values: number[];

    private _firstPointX: number = 0;

    private _clickBoxCall: (value: number, item: T) => void;
    private _clickBoxObj: any;

    private _updateBoxCall: (value: number, item: T) => void;
    private _updateBoxObj: any;

    private _checkBoxStatusCall: (value: number) => ProgressBoxStatus;
    private _checkBoxStatusObj: any;

    private _containerMinWidth: number;

    public autoJump: boolean = false;
    constructor(container: fgui.GComponent, progress: fgui.GProgressBar, boxItemInstanceHandler: () => T) {
        this._container = container;
        this._progress = progress;
        this._boxItemInstanceHandler = boxItemInstanceHandler;
        this._boxItemMap = {};
    }

    /**
     * 添加宝箱点击监听
     * @param call 返回点击的宝箱值与宝箱对象 
     * @param obj 
     */
    public addClickListener(call: (value: number, item: T) => void, obj: any): void {
        this._clickBoxCall = call;
        this._clickBoxObj = obj;
    }

    /**
     * 添加宝箱更新监听
     * @param call 返回更新的宝箱值与宝箱对象 
     * @param obj 
     */
    public addUpdateListener(call: (value: number, item: T) => void, obj: any): void {
        this._updateBoxCall = call;
        this._updateBoxObj = obj;
    }

    /**
     * 添加检测宝箱状态监听
     * @param call 宝箱值作为参数。返回宝箱状态  0:不可领取 1:可领取 2:已领取
     * @param obj 
     */
    public addCheckBoxStatusListener(call: (value: number) => ProgressBoxStatus, obj: any): void {
        this._checkBoxStatusCall = call;
        this._checkBoxStatusObj = obj;
    }

    public destroy(): void {
        for (const key in this._boxItemMap) {
            if (Object.prototype.hasOwnProperty.call(this._boxItemMap, key)) {
                const item: T = this._boxItemMap[key];
                if (item) {
                    item.dispose();
                }
            }
        }
        this._boxItemMap = {};
    }

    /**
     * 初始化
     * @param values 宝箱对应数值列表
     * @param showType 显示类型 0：容器长度等分 1：第一个跟最后一个设置在半个宝箱宽度位置，其他的间距等分
     * @param offsetX x 偏移量
     * @param offsetY y 偏移量
     * @returns
     */
    public init(values: V[], showType: number = 0, offsetX: number = 0, offsetY: number = 0): void {
        if (!this._container || !this._progress) {
            return;
        }
        this._values = values.map(e => {
            return e.score;
        }, this);
        let maxWidth: number = Number.MIN_VALUE;
        let firstNum: number = Math.min(...this._values);
        let gap: number = Math.floor(this._container.width / values.length)
        if (showType == 0) {
            for (let i: number = 0; i < values.length; i++) {
                let data: V = values[i];
                let value: number = data.score;
                let item: T = this._boxItemMap[value];
                if (!item) {
                    item = this._boxItemInstanceHandler ? this._boxItemInstanceHandler() : null;
                }
                item.SetData(data)
                item.onClick(this, this.onClickBox, [value, item]);
                item.setPivot(0.5, 0.5, true);

                item.x = ((i + 1) * gap) + offsetX;
                item.y = this._container.height / 2 + offsetY//this._progress.y + item.height / 2;

                this._container.addChild(item);
                this._boxItemMap[value] = item;

                if (value == firstNum && !this._firstPointX) {
                    this._firstPointX = item.x;
                }
                if (item.x > maxWidth) {
                    maxWidth = item.x;
                }
            }
            this._progress.width = maxWidth;
            this._progress.max = this._progress.width;
        } else if (showType == 1) {
            let maxValue: number = Math.max(...this._values);
            let minValue: number = Math.min(...this._values);
            let x: number = 0;
            let pre: number = this._container.width / maxValue;
            let progressWidth: number = Math.round(pre * maxValue);
            this._progress.width = progressWidth;
            this._progress.max = progressWidth;
            for (let i: number = 0; i < values.length; i++) {
                let data: V = values[i];
                let value: number = data.score;
                let item: T = this._boxItemMap[value];
                if (!item) {
                    item = this._boxItemInstanceHandler ? this._boxItemInstanceHandler() : null;
                }
                item.SetData(data)
                item.onClick(this, this.onClickBox, [value, item]);
                item.setPivot(0.5, 0.5, true);
                this._container.addChild(item);
                this._boxItemMap[value] = item;
                if (value == minValue) {
                    x = item.width / 2;
                    if (!this._firstPointX) {
                        this._firstPointX = x;
                    }
                }
                if (value == maxValue) {
                    x = progressWidth - item.width / 2;
                }
                item.x = x + offsetX;
                item.y = this._container.height / 2 + offsetY;
                gap = (progressWidth - item.width) / Math.max(0, values.length - 1);
                x += gap;
            }
        }


    }

    /**
     * 更新 
     * 根据 _checkBoxStatusCall回调函数获取每个宝箱的领取状态 默认跳转到最近一个可以领取的 若无可领取的宝箱则显示当前进度值的宝箱
     * @param progress 当前进度值
     */
    public update(progress: number): void {
        this._progress.value = this.getProgressValue(progress);
        const values: number[] = this._values;
        for (let i: number = 0; i < values.length; i++) {
            let value: number = values[i];
            let item: T = this._boxItemMap[value];
            if (item) {
                if (this._updateBoxCall && this._updateBoxObj) {
                    this._updateBoxCall.call(this._updateBoxObj, value, item);
                }
                item.UpdateView();
            }
        }
        if (this.autoJump) {
            let miniGetValue: number = null;
            let currentValue: number = 0;
            let nums: number[] = this._values;
            for (let i: number = 0; i < nums.length; i++) {
                let value: number = nums[i];
                let status: number = 0;
                if (this._checkBoxStatusCall && this._checkBoxStatusObj) {
                    status = this._checkBoxStatusCall.call(this._checkBoxStatusObj, value);
                }
                if (status == ProgressBoxStatus.CanGet && miniGetValue == null) {
                    miniGetValue = value;
                }
                if (progress > value) {
                    currentValue = value;
                }
            }
            let result: number = miniGetValue != null ? miniGetValue : currentValue;
            this.jumpToPointValue(result);
        }

    }

    /**
     * 跳转到对应数值
     * @param value 
     * @returns 
     */
    private jumpToPointValue(value: number): void {
        let item: T = this._boxItemMap[value];
        if (!item) {
            return;
        }
        let positionX: number = item.x;
        if (positionX <= this._container.width) {
            this._container.scrollPane.setPosX(0);
        } else {
            const max: number = this._container._container.width - this._container.width - (item.width / 2);
            const pos: number = positionX - this._firstPointX + (item.width / 2);
            let posX: number = this.clamp(pos, 0, max);
            this._container.scrollPane.setPosX(posX);
        }
    }

    private clamp(value: number, min: number, max: number): number {
        return Math.max(Math.min(value, max), min);
    }

    /**
     * 获取进度值。
     * 根据数据转换成进度条需要的进度值
     * @param now
     * @returns
     */
    private getProgressValue(now: number): number {
        if (!this._progress) return 0;
        let max = this._progress.width;
        let passX: number = 0;
        let lastValue: number = 0;
        let progress: number = max;
        for (let num in this._boxItemMap) {
            let item: T = this._boxItemMap[num];
            let value: number = Number(num);
            let posX: number = item.x //- (item.width / 2);
            if (now < value) {
                let diffPosX: number = posX - passX;
                let pointDiff: number = value - lastValue;
                let prePoint: number = diffPosX / pointDiff;
                let overValue: number = now - lastValue;
                let overX: number = overValue * prePoint;
                progress = passX + overX;
                break;
            } else {
                passX = posX;
                lastValue = value;
            }
        }
        return progress
    }

    private onClickBox(data: any, item: T): void {
        if (this._clickBoxCall && this._clickBoxObj) {
            this._clickBoxCall.call(this._clickBoxObj, data, item);
        }
    }
}