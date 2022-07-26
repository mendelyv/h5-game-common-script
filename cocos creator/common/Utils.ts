
/**
 * @class name : Utils
 * @description : 基本工具类
 * @author : Ran
 * @time : 2022.05.10
 */
 export default class Utils {

    /**
     * 从子孙节点中找到第一个名字符合的节点，不包括目标节点本身。
     * 使用 深度优先的方式。
     * 若没有找到，则返回null
     * @param targetNode 
     * @param name 
     */
    public static FindChildByName(targetNode: cc.Node, name: string): cc.Node {
        if (!targetNode.children || targetNode.children.length <= 0) return null;
        for (let i = 0; i < targetNode.children.length; i++) {
            const child = targetNode.children[i];
            if (child.name == name) {
                return child;
            }

            let result = this.FindChildByName(child, name);
            if (result != null)
                return result;
        }
        return null;
    }


    /**
     * 获取显示对象hash值
     * @param obj 显示对象
     * @returns hash值或null
     */
    public static getHashCode(obj: any) {
        // return obj._objFlags != null ? obj._objFlags : null;
        return obj._id != null ? obj._id : null;
    }


    /**
     * 随机下标
     * @param len ：数组长度
     * @param count ：需要的下标个数
     * @param repetition ：下标是否可以重复，缺省为false
     * @returns 下标数组(未排序)
     */
    public static randomIndex(len: number, count: number, repetition: boolean = false) {
        let ret = [];
        let key = {};
        let i = 0;
        while (i < count) {
            let _i = Math.floor((Math.random() * len * 100) % len);
            if (key[_i] != null && !repetition) continue;

            ret.push(_i);
            key[_i] = _i;
            i++;
        }
        return ret;
    }


    /**
     * 生成富文本
     * @param str - 字符串
     * @param color - 颜色
     * @param size - 字体大小
     * @returns 富文本字符串
     */
    public static generateRichText(str: string, color?: number | string, size?: number) {
        let ret = "";
        ret = this.colorRichText(str, color);
        ret = this.sizeRichText(ret, size);
        return ret;
    }


    /**
     * 颜色富文本
     * @param str - 字符串
     * @param color - 颜色
     * @returns 富文本字符串
     */
    public static colorRichText(str: string, color?: number | string) {
        if (color === null) return str;

        let ele = `<color=${color}>%d</color>`;
        return ele.replace("%d", str);
    }


    /**
     * 字号富文本
     * @param str - 字符串
     * @param size - 字号
     * @returns 富文本字符串
     */
    public static sizeRichText(str: string, size?: number) {
        if (size === null) return str;

        let ele = `<size=${size}>%d</size>`;
        return ele.replace("%d", str);
    }


    /**
     * 加粗富文本
     * @param str - 字符串
     * @returns 富文本字符串
     */
    public static boldRichText(str: string) {
        let ele = `<b>%d</b>`;
        return ele.replace("%d", str);
    }


    /**
     * 格式化秒数
     * @param second ：秒
     * @param format ：格式，缺省为hh:mm:ss
     * @returns 时间字符串
     */
    public static formatSecond(second: number, format: string = "hh:mm:ss") {
        let h = 0, m = 0, s = 0;
        if (second >= 3600) {
            h = Math.floor(second / 3600);
            second -= h * 3600;
        }
        if (second >= 60) {
            m = Math.floor(second / 60);
            second -= m * 60;
        }
        s = second;
        let formatArr = format.split(":");
        switch (formatArr.length) {
            case 1: return `${s < 10 && formatArr[0].length >= 2 ? "0" : ""}${s}`;
            case 2: return `${m < 10 && formatArr[1].length >= 2 ? "0" : ""}${m}:${s < 10 && formatArr[0].length >= 2 ? "0" : ""}${s}`;
            case 3: return `${h < 10 && formatArr[2].length >= 2 ? "0" : ""}${h}:${m < 10 && formatArr[1].length >= 2 ? "0" : ""}${m}:${s < 10 && formatArr[0].length >= 2 ? "0" : ""}${s}`;
        }
        return "";
    }


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


    /**
     * 添加按钮点击事件
     * @param target - 目标节点或按钮组件
     * @param scriptNode - 响应函数script组件所属节点
     * @param scriptName - 响应函数script组件名称
     * @param functionName - 响应函数名称
     * @param data - 自定义参数
     * @returns true or false
     */
    public static addButtonClickHandler(target: cc.Node | cc.Button, scriptNode: cc.Node, scriptName: string, functionName: string, data?: any) {
        let button: cc.Button;
        if (target instanceof cc.Button) button = target;
        else if (target instanceof cc.Node) button = target.getComponent(cc.Button);
        if (!button) {
            console.warn("addButtonClickHandler: target node has no button component");
            return false;
        }
        let h = new cc.Component.EventHandler();
        h.target = scriptNode;
        h.component = scriptName;
        h.handler = functionName;
        h.customEventData = data;
        button.clickEvents.push(h);
        return true;
    }


    /**
     * 节点添加事件，这个方法默认会给节点添加屏蔽点击穿透组件
     * @param target - 事件节点
     * @param eventType - 事件类型
     * @param callback - 回调函数
     * @param callbackObj - 回调函数所属对象
     * @param once - 是否只监听一次
     * @param touchThough - 是否穿透
     */
    public static addNodeEvent(target: cc.Node, eventType, callback: Function, callbackObj: any, once: boolean = false, touchThough: boolean = false) {
        if(once) {
            target.once(eventType, callback, callbackObj);
        } else {
            target.on(eventType, callback, callbackObj);
        }
        if(!touchThough) {
            if(!target.getComponent(cc.BlockInputEvents)) {
                target.addComponent(cc.BlockInputEvents);
            }
        }
    }


}
