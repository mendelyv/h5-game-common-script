export abstract class BezierBasePluginDto {
    /** 飞行对象 */
    public obj: unknown;
    public speed?: number;
    /** 辅助点 */
    public auxiliaryVectors: Laya.Vector3[];
    /** 防抖约束距离 */
    public epsilon?: number;
    /** 步进检测距离 */
    public stepDistance?: number;
    /** 生成点数量 */
    public count?: number;
    /** 旋转插值比值 */
    public rotateFactor?: number;
}

export default abstract class BezierBasePlugin {
    public dto: BezierBasePluginDto;
    protected _completeHandler: Laya.Handler;
    protected _vectors: Laya.Vector3[];
    public get vectors() {
        return this._vectors;
    }
    protected _currentIndex: number;

    public constructor(dto: BezierBasePluginDto) {
        this.init(dto);
        this.reset();
    }

    public init(dto: BezierBasePluginDto) {
        if (null != this.dto) {
            this._destroyDto();
            this.dto = null;
        }

        this.dto = dto;
        if (null == this.dto.epsilon) this.dto.epsilon = 0.01;
        if (null == this.dto.stepDistance) this.dto.stepDistance = 0.1;
        if (null == this.dto.count) this.dto.count = 10;
    }

    /**
     * 设置完成回调
     * @param handler - 
     * @param triggerPrevious - 如果 原handler 非空，是否触发
     */
    public setCompleteHandler(handler: Laya.Handler, triggerPrevious: boolean = false) {
        if (null != this._completeHandler && triggerPrevious) {
            this._completeHandler.run();
            this._completeHandler.clear();
            this._completeHandler = null;
        }
        this._completeHandler = handler;
    }

    public frameUpdate(dt?: number) {
        // if (null == dt) dt = Laya.timer.delta;
        if (null == dt) dt = 16;
        this._onUpdate(dt);
    }

    public resetCurrentIndex() {
        this._currentIndex = 0;
    }

    public reset() {
        if (null == this.dto) return;
        this._vectors = this._generateVectors();
        this.resetCurrentIndex();
    }

    /** 帧事件 */
    protected abstract _onUpdate(dt: number): void;
    protected _onComplete() {
        if (null != this._completeHandler) {
            this._completeHandler.run();
        }
    }

    private _calculateBezierPoint(points: Laya.Vector3[], t: number): Laya.Vector3 {
        let pts: Laya.Vector3[] = points.map((p) => p.clone());
        let n = pts.length;
        for (let r = 1; r < n; r++) {
            for (let i = 0; i < n - r; i++) {
                pts[i].x = pts[i].x * (1 - t) + pts[i + 1].x * t;
                pts[i].y = pts[i].y * (1 - t) + pts[i + 1].y * t;
                pts[i].z = pts[i].z * (1 - t) + pts[i + 1].z * t;
            }
        }
        return pts[0];
    }

    /**
     * 创建贝塞尔曲线点
     * @param anchors - 曲线控制点，包含起点和终点
     * @param count - 生成点的数量
     * @returns 生成的曲线点
     */
    public _createBezierPoints(anchors: Laya.Vector3[], count: number): Laya.Vector3[] {
        const points = [];
        for (let i = 0; i <= count; i++) {
            const t = i / count;
            points.push(this._calculateBezierPoint(anchors, t));
        }
        return points;
    }

    /** 生成贝塞尔点 */
    protected _generateVectors(): Laya.Vector3[] {
        return this._createBezierPoints(this.dto.auxiliaryVectors, this.dto.count);
    }

    /** 检查索引是否需要步进 */
    protected _checkCurrentStep(distance: number): boolean {
        return distance <= this.dto.stepDistance;
    }

    protected _destroyDto() {
        this.dto.obj = null;
    }

    public destroy() {
        this._destroyDto();
        if (null != this._completeHandler) {
            this._completeHandler.clear();
            this._completeHandler = null;
        }
    }

    // class BezierBasePlugin end
}
