/**
 * @class: DateUtils
 * @description: 日期工具类
 * @author: Ran
 * @time: 2024-08-12 20:07:39
 */
export default class TimeUitls {


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


    // class end
}
