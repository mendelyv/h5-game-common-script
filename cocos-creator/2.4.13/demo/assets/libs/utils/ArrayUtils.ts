/**
 * @class: ArrayUtils
 * @description: 数组工具类
 * @author: Ran
 * @time: 2024-08-12 20:05:00
 */
export default class ArrayUtils {


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
     * 获取一个范围内的随机数，[min, max]
     * @param min - 最小值
     * @param max - 最大值
     * @param integer - 是否取整，缺省为true
     * @returns 
     */
    public static randomRange(min: number, max: number, integer: boolean = true) {
        return integer ? Math.floor(Math.random() * (max - min + 1)) + min : Math.random() * (max - min) + min;
    }


    // class end
}
