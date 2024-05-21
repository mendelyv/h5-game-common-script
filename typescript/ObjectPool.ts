export default class ObjectPool {
    private static _instance: ObjectPool;
    public static get instance(): ObjectPool {
        if (ObjectPool._instance == null) ObjectPool._instance = new ObjectPool();
        return ObjectPool._instance;
    }
    private static CACHE_COUNT: number = 1000;
    private static MAX_PARAMS_LEN: number = 10;//构造函数参数个数最大值
    private poolDic: Object = {};
    private classObjDic: Object = {};
    private cacheCountDic: Object = {};

    public constructor() {

    }

    /** 创建对象池
     * @param poolName ：对象池名字
     * @param classObj ：范例对象
     * @param cacheCount ：池子容量
     */
    public createObjectPool(poolName: string, classObj: any, cacheCount?: number): void {
        if (!this.poolDic[poolName]) {
            this.poolDic[poolName] = [];
            this.classObjDic[poolName] = classObj;
            if (ObjectPool.CACHE_COUNT > 0) {
                this.cacheCountDic[poolName] = cacheCount;
            }
        }
    }

    /** 清空对象池
     * @param poolName ：对象池名字
     */
    public cleanObjectPool(poolName: string): void {
        if (this.poolDic[poolName]) {
            var arr: Array<any> = this.poolDic[poolName];
            var l: number = arr.length;
            for (var i: number = 0; i < l; i++) {
                this.destructObj(arr.pop());
            }
            arr.length = 0;
            delete this.poolDic[poolName];
            delete this.classObjDic[poolName];
            delete this.cacheCountDic[poolName];
        }
    }

    /** 有无对象池
     * @param poolName ：对象池名字
     */
    public hasObjectPool(poolName: string): boolean {
        if (this.poolDic[poolName]) return true;
        return false;
    }

    /** 回收对象，该函数会调用对象的recycle方法，请在对象中按需求自行实现
     * @param poolName ：对象池名字
     * @param obj ：对象
     */
    public pushObj(poolName: string, obj: any): void {
        if (obj == null) return;
        if (!this.poolDic[poolName]) {
            this.destructObj(obj);
            return;
        }
        var arr: Array<any> = this.poolDic[poolName];
        var maxCount: number = this.cacheCountDic[poolName] ? this.cacheCountDic[poolName] : ObjectPool.CACHE_COUNT;
        if (arr.length >= maxCount) {
            this.destructObj(obj);
            return;
        }
        if (obj.recycle) {
            obj.recycle();
        }
        if (obj.parent) {
            obj.parent.removeChild(obj);
            // console.log(" ===== 回收对象 ===== ");
        }
        arr.push(obj);
    }

    /** 拉取对象，该函数会调用对象的reset方法，请在对象中按需求自行实现。
     * 若对象池无对象，即会调用该对象的构造函数构造，最大参数长度支持10个
     * @param poolName ：对象池名字
     * @param params ：对象构造函数参数
     */
    public getObj(poolName: string, ...params: any[]): any {
        if (!this.poolDic[poolName]) {
            // Utils.showLog("没有创建对象池 " + poolName);
            console.warn(" ----- 未创建 " + poolName + " 对象池 ----- ");
            return;
        }
        let obj = null;
        let arr: Array<any> = this.poolDic[poolName];
        if (arr.length > 0) {
            obj = arr.shift();
            if (obj.reset) {
                obj.reset();
            }
        } else {
            let len = params.length;
            if (len > ObjectPool.MAX_PARAMS_LEN) {
                console.error(" ***** 构造函数参数个数过多 ***** ");
                return null;
            }
            switch (len) {
                case 0: obj = new this.classObjDic[poolName].constructor(); break;
                case 1: obj = new this.classObjDic[poolName].constructor(params[0]); break;
                case 2: obj = new this.classObjDic[poolName].constructor(params[0], params[1]); break;
                case 3: obj = new this.classObjDic[poolName].constructor(params[0], params[1], params[2]); break;
                case 4: obj = new this.classObjDic[poolName].constructor(params[0], params[1], params[2], params[3]); break;
                case 5: obj = new this.classObjDic[poolName].constructor(params[0], params[1], params[2], params[3], params[4]); break;
                case 6: obj = new this.classObjDic[poolName].constructor(params[0], params[1], params[2], params[3], params[4], params[5]); break;
                case 7: obj = new this.classObjDic[poolName].constructor(params[0], params[1], params[2], params[3], params[4], params[5], params[6]); break;
                case 8: obj = new this.classObjDic[poolName].constructor(params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7]); break;
                case 9: obj = new this.classObjDic[poolName].constructor(params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8]); break;
                case 10: obj = new this.classObjDic[poolName].constructor(params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8], params[9]); break;
            }
        }
        return obj;
    }

    /** 析构对象，该函数会调用对象的destructor方法，请在对象中按需求自行实现。
     */
    private destructObj(obj: any): void {
        if (obj == null) return;
        if (obj.destructor) {
            obj.destructor();
        } else {
            if (obj.stop) {
                obj.stop();
            }
            if (obj.texture) {
                obj.texture = null;
            }
        }
    }

    /** 输出对象池的数量 */
    public printObjCount(poolName: string): void {
        if (this.poolDic[poolName]) {
            // Utils.showLog(poolName + " 对象池中包含对象数量 " + this.poolDic[poolName].length);
        }
    }


    //class end    
}
