import {RedTipComponent} from "./RedTipComponent";

//  全局红点控制

class RedTipManager {
    private timer: number = undefined;
    // 刷新时间
    REFRESH_TIME = 1//60;

    private redMap: { [key: string]: RedTipComponent } = {};
    // 查看次数
    private readCount: { [key: string]: number } = {};

    // 注册红点
    public register(key: string, target: RedTipComponent) {
        this.redMap[key] = target;
    }
    public unregister(key: string) {
        delete this.redMap[key];
    }

    // 查看次数
    public addReadCount(key: string, num: number = 1) {
        if (this.readCount[key]) {
            this.readCount[key] += num;
        } else {
            this.readCount[key] = num;
        }
    }
    public setReadCount(key: string, num: number) {
        this.readCount[key] = num;
    }
    public getReadCount(key: string): number {
        return this.readCount[key] || 0;
    }

    /**
     * 查看红点状态
     * @param key 
     */
    public isRed(key: string): boolean {
        return this.redMap[key].isRed();
    }

    /**
     * 设置红点通知 
     * @param key 
     * @param compareFn 
     * @param change 
     * @param delay >60 不自动刷新
     * @returns 
     */
    public notify(key: string, compareFn?: (key: string) => number, change: (key: string) => void = undefined, delay: number = this.REFRESH_TIME) {
        if (!this.redMap[key]) {
            return;
        }
        this.redMap[key].notify(compareFn, change);
        this.redMap[key].updateRed();
        this.redMap[key].setUpdateTime(delay);
    }
    // 更新一次红点
    public updateNotify(key: string) {
        if (!this.redMap[key]) {
            return;
        }
        this.redMap[key].updateRed();
    }
    public updateAll() {
        this.update(0)
    }

    private update(dt) {
        for (const key in this.redMap) {
            if (Object.prototype.hasOwnProperty.call(this.redMap, key)) {
                let element = this.redMap[key];
                element.updateRed();
            }
        }
    }

    /**
     * 刷新
     */
    // private runUpdate() {
    //     this.timer = CommonUtil.instance.schedule(REFRESH_TIME, cc.macro.REPEAT_FOREVER, (dt) => {
    //         this.update(dt)
    //     })
    // }
    // private stopUpdate() {
    //     CommonUtil.instance.unschedule(this.timer);
    //     this.timer = undefined;
    // }

    onInit() {
        // this.runUpdate();
    }

}
export let redTipManager = new RedTipManager();
redTipManager.onInit();

