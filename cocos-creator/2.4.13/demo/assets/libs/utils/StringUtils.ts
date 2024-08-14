/**
 * @class: StringUtils
 * @description: 字符串工具类
 * @author: Ran
 * @time: 2024-08-12 20:06:31
 */
export default class StringUtils {


    /**
     * 判断空字符串
     * @param str - 
     * @returns 
     */
    public static empty(str: string): boolean {
        return str == null || str == "" || str.length <= 0;
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


    // class end
}
