/**
 * @class name : OBB
 * @description : OBB(Oriented bounding box)检测。两个矩形的半径距离投影到轴上，两个矩形的中心点连线投影到轴上。推断两个矩形的中心连线投影，和两个矩形的半径投影之和的大小。
 * @author : Ran
 * @time : 2023-05-02 21:20:56 
 */
export class OBB {

    /**
     * 向量点乘
     * @param v1 - 
     * @param v2 - 
     * @returns 
     */
    public static dot(v1: cc.Vec2, v2: cc.Vec2) {
        return Math.abs(v1.x * v2.x + v1.y * v2.y);
    }


    /**
     * 通过旋转角度，获取一个显示节点的两个检测轴单位向量
     * @param node -
     * @returns
     */
    public static getAxis(rotation: number) {
        let axis: cc.Vec2[] = [];
        axis[0] = new cc.Vec2();
        axis[0].x = Math.cos(rotation);
        axis[0].y = Math.sin(rotation);

        axis[1] = new cc.Vec2();
        axis[1].x = -Math.sin(rotation);
        axis[1].y = Math.cos(rotation);

        return axis;
    }


    /**
     * 获取半径投影
     * @param origins - 投影坐标系原点矩形所有检测轴
     * @param axis - 投影轴单位向量
     * @param node - 
     * @returns
     */
    public static getRadiusProjection(origins: cc.Vec2[], axis: cc.Vec2, node: cc.Node) {
        let projectionAxisX = this.dot(axis, origins[0]);
        let projectionAxisY = this.dot(axis, origins[1]);
        let halfW = node.width / 2;
        let halfH = node.height / 2;
        return halfW * projectionAxisX + halfH * projectionAxisY;
    }


    /**
     * 判断两个显示节点是否碰撞
     * @param node1 - 
     * @param node2 - 
     * @returns 
     */
    public static isCollision(node1: cc.Node, node2: cc.Node) {
        let center = new cc.Vec2(node1.x - node2.x, node1.y - node2.y);

        let axis1 = this.getAxis(node1.rotation);
        let axis2 = this.getAxis(node2.rotation);
        let axes = [axis1[0], axis1[1], axis2[0], axis2[1]];

        for (let i = 0; i < axes.length; i++) {
            let projection1 = this.getRadiusProjection(axis1, axes[i], node1);
            let projection2 = this.getRadiusProjection(axis2, axes[i], node2);
            let centerProjection = this.dot(center, axes[i]);
            if (projection1 + projection2 <= centerProjection)
                return false;
        }
        return true;
    }
}
