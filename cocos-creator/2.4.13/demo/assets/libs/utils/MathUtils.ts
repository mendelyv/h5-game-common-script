export default class MathUtils {


    /**
     * 生成bezier曲线路径点
     * @param anchors - 曲线控制点数组，包含起终点
     * @param count - 生成的曲线点数
     * @returns 生成的曲线点数组
     */
    public static createBezierPoints(anchors: cc.Vec2[], count: number): cc.Vec2[] {
        let points = [];
        for (let i = 0; i <= count; i++) {
            let p = this.caculateBezierPoint(anchors, i / count);
            points.push(p);
        }
        return points;
    }


    /**
     * @param points - 曲线控制点数组，包含起终点
     * @param t - 比例，[0, 1]
     * @returns 生成的曲线点
     */
    public static caculateBezierPoint(points: cc.Vec2[], t: number) {
        let len = points.length;
        let res = new cc.Vec2(0, 0);
        let combination = function(n, m) {
            let nFactorial = 1, mFactorial = 1;
            while (m > 0) {
                nFactorial *= n;
                mFactorial *= m;
                n--;
                m--;
            }
            return nFactorial / mFactorial;
        };
        for (let i = 0; i < len; i++) {
            let p = points[i];
            res.x += p.x * combination(len - 1, i) * Math.pow(t, i) * Math.pow(1 - t, len - 1 - i);
            res.y += p.y * combination(len - 1, i) * Math.pow(t, i) * Math.pow(1 - t, len - 1 - i);
        }
        return res;
    }


    /**
     * 弧度转角度
     * @param radian - 弧度
     * @returns 角度
     */
    public static RadianToAngle(radian: number) {
        return radian * 180 / Math.PI;
    }


    /**
     * 角度转弧度
     * @param angle - 角度
     * @returns 弧度
     */
    public static AngleToRadian(angle: number) {
        return angle * Math.PI / 180;
    }


    // class end
}
