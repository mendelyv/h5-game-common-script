import BezierBasePlugin, { BezierBasePluginDto } from "./BezierBasePlugin";

export class Bezier3DPluginDto extends BezierBasePluginDto {
    public override obj: Laya.Sprite3D;
    /** Laya世界单元格/s */
    public override speed?: number;
}

export default class Bezier3DPlugin extends BezierBasePlugin {
    public override dto: Bezier3DPluginDto;
    /** up 向量计算辅助向量，默认 z 轴正方向为 forward */
    protected _auxiliaryAxis = new Laya.Vector3(1, 0, 0);

    public constructor(dto: Bezier3DPluginDto) {
        super(dto);
    }

    public override init(dto: Bezier3DPluginDto): void {
        super.init(dto);
        if (null == this.dto.rotateFactor) this.dto.rotateFactor = 0.01;
        if (null == this.dto.speed) this.dto.speed = 5;
        this.dto.speed /= 1000;
    }

    public lookAt(to: Laya.Vector3) {
        let obj = this.dto.obj;
        let quaternion = this._calculateLookAtQuaternion(obj.transform.position, to);
        obj.transform.rotation = quaternion;
    }

    public override _onUpdate(dt: number): void {
        if (this._currentIndex >= this._vectors.length) {
            this._onComplete();
            return;
        }

        let obj = this.dto.obj;
        const pos = obj.transform.position;
        const targetPoint = this._vectors[this._currentIndex];

        const dx = targetPoint.x - pos.x;
        const dy = targetPoint.y - pos.y;
        const dz = targetPoint.z - pos.z;
        const distance = Math.hypot(dx, dy, dz);

        if (distance > this.dto.epsilon) {
            const move = Math.min(distance, this.dto.speed * dt);
            obj.transform.localPositionX += (dx / distance) * move;
            obj.transform.localPositionY += (dy / distance) * move;
            obj.transform.localPositionZ += (dz / distance) * move;

            if (this._currentIndex + 1 < this._vectors.length) {
                const nextTarget = this._vectors[this._currentIndex + 1];
                const newRot = this._calculateLookAtQuaternion(pos, nextTarget);
                const currentRot = obj.transform.rotation;
                const smoothRot = new Laya.Quaternion();
                const lerpFactor = Math.min(1.0, dt * this.dto.rotateFactor);
                Laya.Quaternion.slerp(currentRot, newRot, lerpFactor, smoothRot);
                obj.transform.rotation = smoothRot;
            }
        }

        if (this._checkCurrentStep(distance)) {
            this._currentIndex++;
        }
    }

    private _calculateLookAtQuaternion(from: Laya.Vector3, to: Laya.Vector3): Laya.Quaternion {
        const forward = new Laya.Vector3();
        Laya.Vector3.subtract(to, from, forward);
        Laya.Vector3.normalize(forward, forward);

        let right = this._auxiliaryAxis;
        if (Math.abs(Laya.Vector3.dot(forward, right)) > 0.999) {
            right = new Laya.Vector3(0, 0, 1);
        }

        const up = new Laya.Vector3();
        Laya.Vector3.cross(right, forward, up);
        Laya.Vector3.normalize(up, up);

        Laya.Vector3.cross(forward, up, right);
        Laya.Vector3.normalize(right, right);

        // prettier-ignore
        const rotMat = new Laya.Matrix4x4(
            right.x,   right.y,   right.z,   0,
            up.x,      up.y,      up.z,      0,
            forward.x, forward.y, forward.z, 0,
            0,         0,         0,         1,
        );

        const rotation = new Laya.Quaternion();
        const t = new Laya.Vector3(),
            s = new Laya.Vector3();
        rotMat.decomposeTransRotScale(t, rotation, s);
        return rotation;
    }

    // class Bezier2DPlugin end
}
