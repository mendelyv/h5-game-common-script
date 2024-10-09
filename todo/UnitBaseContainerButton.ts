export interface IUnitBaseContainerButton {
    boxScale: Laya.Box;
    boxClick: Laya.Box;
    imgButton?: Laya.Image;
    lblName?: Laya.Label;
}

/**
 * @class: UnitBaseContainerButton
 * @description: 带容器的按钮基类
 * @author: Ran
 * @time: 2024-07-17 10:41:11
 */
export default class UnitBaseContainerButton<T extends Laya.View & IUnitBaseContainerButton> extends sg.ViewBaseWithContainer<T> {


    // ===== auxiliaries =====
    protected _mouseDownPoint: Laya.Point = new Laya.Point(0, 0);
    protected _mouseMovePoint: Laya.Point = new Laya.Point(0, 0);
    /** 点击时的缩放尺寸 */
    protected _clickScale: Laya.Point;
    /** 常态缩放尺寸 */
    protected _clickDefaultScale: Laya.Point;
    /** 缩放偏移量 */
    protected _clickScaleOffset: Laya.Point;
    /** 缩放tween时间间隔 */
    protected _clickInterval: number = 100;
    /** 缩放tween计时 */
    protected _clickScaleTimer: number = 0;
    /** 缩放方向, 0 为按下缩放，1 为抬起缩放 */
    protected _clickScaleDirection: number = 0;
    /** 移动取消距离 */
    protected _clickMoveCancelDistance: number;
    /** 移动取消速度 */
    protected _clickMoveCancelSpeed: number = 16;
    // ===== auxiliaries =====

    protected clickHandler: Laya.Handler;


    constructor(container: T) {
        super(container);
        this._mouseDownPoint = new Laya.Point(0, 0);
        this.setScaleAuxiliary();
    }


    /**
     * 设置辅助变量
     * @param defaultScale - 常态缩放尺寸，缺省1.0
     * @param offset - 缩放偏移量，缺省0.1
     * @param cancelDistance - 移动取消距离，缺省为按钮宽度的一半
     * @param cancelSpeed - 移动取消速度，缺省20
     */
    public setScaleAuxiliary(): void;
    public setScaleAuxiliary(defaultScale: Laya.Point): void;
    public setScaleAuxiliary(defaultScale: Laya.Point, offset: Laya.Point): void;
    public setScaleAuxiliary(defaultScale: Laya.Point, offset: Laya.Point, cancelDistance: number): void;
    public setScaleAuxiliary(defaultScale: Laya.Point, offset: Laya.Point, cancelDistance: number, cancelSpeed: number): void;
    public setScaleAuxiliary(defaultScale?: Laya.Point, offset?: Laya.Point, cancelDistance?: number, cancelSpeed?: number): void {
        if (defaultScale == null) defaultScale = new Laya.Point(1.0, 1.0);
        this._clickDefaultScale = defaultScale;
        this.scale(defaultScale.x, defaultScale.y);

        if (offset == null) offset = new Laya.Point(0.1, 0.1);
        this._clickScaleOffset = offset;
        this._clickScale = new Laya.Point(defaultScale.x + offset.x, defaultScale.y + offset.y);

        this._clickMoveCancelDistance = cancelDistance == null ? this.width / 2 : cancelDistance;
        this._clickMoveCancelSpeed = cancelSpeed == null ? 20 : cancelSpeed;
    }


    public initContainer(args?: unknown): void {
        super.initContainer(args);
        let c = this.container;
        c.boxClick.on(Laya.Event.MOUSE_DOWN, this, this._onMouseDown);
        c.boxClick.on(Laya.Event.MOUSE_UP, this, this._onMouseUp);
    }


    protected _onMouseDown(e: Laya.Event): void {
        let c = this.container;
        this._clickScaleDirection = 0;
        this._clickScaleTimer = 0;
        this._mouseDownPoint.x = e.stageX;
        this._mouseDownPoint.y = e.stageY;
        if (!Laya.timer.hasTimer(this, this._onUpdate))
            Laya.timer.frameLoop(1, this, this._onUpdate);
        if (!c.boxClick.hasListener(Laya.Event.MOUSE_MOVE))
            c.boxClick.on(Laya.Event.MOUSE_MOVE, this, this._onMouseMove);
        if (!c.boxClick.hasListener(Laya.Event.MOUSE_UP))
            c.boxClick.on(Laya.Event.MOUSE_UP, this, this._onMouseUp);
    }


    protected _onMouseUp(): void {
        let c = this.container;
        this._clickScaleDirection = 1;
        this._clickScaleTimer = 0;
        if (c.boxClick.hasListener(Laya.Event.MOUSE_MOVE))
            c.boxClick.off(Laya.Event.MOUSE_MOVE, this, this._onMouseMove);
    }


    protected _onMouseCancelUp(): void {
        let c = this.container;
        this._clickScaleDirection = 2;
        this._clickScaleTimer = 0;
        if (c.boxClick.hasListener(Laya.Event.MOUSE_MOVE))
            c.boxClick.off(Laya.Event.MOUSE_MOVE, this, this._onMouseMove);
        if (c.boxClick.hasListener(Laya.Event.MOUSE_UP))
            c.boxClick.off(Laya.Event.MOUSE_UP, this, this._onMouseUp);
    }


    protected _onMouseMove(e: Laya.Event): void {
        this._onMouseCancelUp();
        return;

        let lastMovePoint = new Laya.Point(this._mouseMovePoint.x, this._mouseMovePoint.y);
        this._mouseMovePoint.x = e.stageX;
        this._mouseMovePoint.y = e.stageY;
        if (this._checkMouseMoveOut()) {
            if (this._clickScaleDirection != 1) {
                // console.warn(" ===== out cancel ===== ");
                this._onMouseUp();
                return;
            }
        }

        if (this._checkMouseMoveSpeed(lastMovePoint)) {
            if (this._clickScaleDirection != 1) {
                // console.warn(" ===== speed cancel ===== ");
                this._onMouseUp();
                return;
            }
        }
    }


    protected _onUpdate(): void {
        switch (this._clickScaleDirection) {
            case 0: this._onDownScaleUpdate(); break;
            case 1: this._onUpScaleUpdate(); break;
            case 2: this._onCancelUpScaleUpdate(); break;
        }
    }


    protected _onDownScaleUpdate(): void {
        let delta = Laya.timer.delta;
        let c = this.container;
        this._clickScaleTimer += delta;
        if (this._clickScaleTimer >= this._clickInterval) {
            c.boxScale.scale(this._clickScale.x, this._clickScale.y);
        } else {
            c.boxScale.scale(
                this._clickDefaultScale.x + this._clickScaleOffset.x * (this._clickScaleTimer / this._clickInterval),
                this._clickDefaultScale.y + this._clickScaleOffset.y * (this._clickScaleTimer / this._clickInterval),
            )
        }
    }


    protected _onUpScaleUpdate(): void {
        let delta = Laya.timer.delta;
        let c = this.container;
        this._clickScaleTimer += delta;
        if (this._clickScaleTimer >= this._clickInterval) {
            this._onUpScaleTweenComplete();
        } else {
            c.boxScale.scale(
                this._clickScale.x - this._clickScaleOffset.x * (this._clickScaleTimer / this._clickInterval),
                this._clickScale.y - this._clickScaleOffset.y * (this._clickScaleTimer / this._clickInterval),
            )
        }
    }


    protected _onCancelUpScaleUpdate(): void {
        let delta = Laya.timer.delta;
        let c = this.container;
        this._clickScaleTimer += delta;
        if (this._clickScaleTimer >= this._clickInterval) {
            c.boxScale.scale(this._clickDefaultScale.x, this._clickDefaultScale.y);
            if (Laya.timer.hasTimer(this, this._onUpdate))
                Laya.timer.clear(this, this._onUpdate);
        } else {
            c.boxScale.scale(
                this._clickScale.x - this._clickScaleOffset.x * (this._clickScaleTimer / this._clickInterval),
                this._clickScale.y - this._clickScaleOffset.y * (this._clickScaleTimer / this._clickInterval),
            )
        }
    }


    protected _onUpScaleTweenComplete(): void {
        if (Laya.timer.hasTimer(this, this._onUpdate))
            Laya.timer.clear(this, this._onUpdate);
        if (this.clickHandler != null)
            this.clickHandler.runWith(this);
    }


    protected _checkMouseMoveOut(): boolean {
        let tools = mgr.toolsMgr;
        let distance = tools.getDistance(this._mouseDownPoint, this._mouseMovePoint);
        return distance > this._clickMoveCancelDistance;
    }


    protected _checkMouseMoveSpeed(lastMovePoint: Laya.Point): boolean {
        let tools = mgr.toolsMgr;
        let distance = tools.getDistance(lastMovePoint, this._mouseMovePoint);
        return distance > this._clickMoveCancelSpeed;
    }


    public addClick(handler: Laya.Handler) {
        if (this.clickHandler != null)
            this.clickHandler.clear();
        this.clickHandler = handler;
    }


    public setName(value: string) {
        if (this.container.lblName != null)
            this.container.lblName.text = value;
    }


    public setImage(url: string, atlas: boolean = true) {
        let c = this.container;
        if (c.imgButton == null) return;
        if (atlas) {
            c.imgButton.skin = url;
        } else {
            url = mgr.IconMgr.ROOT_PATH + url;
            mgr.icon.drawTexture(url, c.imgButton);
        }
    }


    public enable(): void {
        let c = this.container;
        if (!c.boxClick.hasListener(Laya.Event.MOUSE_DOWN))
            c.boxClick.on(Laya.Event.MOUSE_DOWN, this, this._onMouseDown);
        if (!c.boxClick.hasListener(Laya.Event.MOUSE_UP))
            c.boxClick.on(Laya.Event.MOUSE_UP, this, this._onMouseUp);
        c.boxScale.filters = [];
    }


    public disable(): void {
        let c = this.container;
        if (c.boxClick.hasListener(Laya.Event.MOUSE_DOWN))
            c.boxClick.off(Laya.Event.MOUSE_DOWN, this, this._onMouseDown);
        if (c.boxClick.hasListener(Laya.Event.MOUSE_UP))
            c.boxClick.off(Laya.Event.MOUSE_UP, this, this._onMouseUp);
        if (c.boxClick.hasListener(Laya.Event.MOUSE_MOVE))
            c.boxClick.off(Laya.Event.MOUSE_MOVE, this, this._onMouseMove);
        c.boxScale.filters = mgr.toolsMgr.getFiltersGray();
    }


    public set gray(value: boolean) {
        let c = this.container;
        if (value) c.boxScale.filters = mgr.toolsMgr.getFiltersGray();
        else c.boxScale.filters = [];
    }


    onDestroy(): void {
        let c = this.container;
        Laya.timer.clearAll(this);
        if (this.clickHandler != null) {
            this.clickHandler.clear();
            this.clickHandler = null;
        }
        if (c.boxClick.hasListener(Laya.Event.MOUSE_DOWN))
            c.boxClick.off(Laya.Event.MOUSE_DOWN, this, this._onMouseDown);
        if (c.boxClick.hasListener(Laya.Event.MOUSE_UP))
            c.boxClick.off(Laya.Event.MOUSE_UP, this, this._onMouseUp);
        if (c.boxClick.hasListener(Laya.Event.MOUSE_MOVE))
            c.boxClick.off(Laya.Event.MOUSE_MOVE, this, this._onMouseMove);
        super.onDestroy();
    }


    // class end
}
