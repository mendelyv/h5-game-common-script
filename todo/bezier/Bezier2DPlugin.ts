import BezierBasePlugin, { BezierBasePluginDto } from "./BezierBasePlugin";

export class Bezier2DPluginDto extends BezierBasePluginDto {
    public override obj: fgui.GObject;
    /** 速度 px/s */
    public override speed?: number;
}

export default class Bezier2DPlugin extends BezierBasePlugin {
    public override dto: Bezier2DPluginDto;

    public constructor(dto: Bezier2DPluginDto) {
        super(dto);
    }

    public override init(dto: Bezier2DPluginDto): void {
        super.init(dto);
        if (null == this.dto.rotateFactor) this.dto.rotateFactor = 0.12;
        if (null == this.dto.speed) this.dto.speed = 120;
        this.dto.speed /= 1000;
    }

    public lookAt(to: Laya.Vector3) {
        let rotation = this._calculateLookAtRotation(to);
        let obj = this.dto.obj;
        obj.rotation = this._lerpAngleDegrees(obj.rotation, rotation, 1);
    }

    protected _lerpAngleDegrees(a: number, b: number, t: number): number {
        // 处理环绕：例如 350° -> 10° 应该平滑到 0° 而不是绕一整圈
        let delta = b - a + 90;
        delta = delta - 360 * Math.floor((delta + 180) / 360);
        return a + delta * t;
    }

    protected _calculateLookAtRotation(to: Laya.Vector3): number {
        let obj = this.dto.obj;
        let dx = to.x - obj.x;
        let dy = to.y - obj.y;
        let radian = Math.atan2(dy, dx);
        return (radian * 180) / Math.PI;
    }

    protected override _onUpdate(dt: number): void {
        if (this._currentIndex >= this._vectors.length) {
            this._onComplete();
            return;
        }

        let targetPoint = this._vectors[this._currentIndex];

        let obj = this.dto.obj;
        let dx = targetPoint.x - obj.x;
        let dy = targetPoint.y - obj.y;
        let distance = Math.hypot(dx, dy);

        if (distance > this.dto.epsilon) {
            let targetRotation = this._calculateLookAtRotation(targetPoint);
            obj.rotation = this._lerpAngleDegrees(
                obj.rotation,
                targetRotation,
                this.dto.rotateFactor,
            );
        }

        let move = Math.min(distance, this.dto.speed * dt);
        if (distance > this.dto.epsilon) {
            obj.x += (dx / distance) * move;
            obj.y += (dy / distance) * move;
        }

        if (this._checkCurrentStep(distance)) {
            this._currentIndex++;
        }
    }

    // class Bezier2DPlugin end
}
