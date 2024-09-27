export default class MathUtils {


    /**
     * 计算绕圆心旋转后的点
     * @param cx - 圆心x
     * @param cy - 圆心y
     * @param x - 
     * @param y - 
     * @param radian - 弧度
     * @returns {x: number, y: number}
     */
    public static calculateRotatePoint(cx: number, cy: number, x: number, y: number, radian: number): { x: number, y: number } {
        const cosTheta = Math.cos(radian);
        const sinTheta = Math.sin(radian);
        const xPrime = x - cx;
        const yPrime = y - cy;
        const _x = xPrime * cosTheta - yPrime * sinTheta + cx;
        const _y = xPrime * sinTheta + yPrime * cosTheta + cy;
        return { x: _x, y: _y }
    }


    // class end
}
