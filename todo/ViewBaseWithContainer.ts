export default class ViewBaseWithContainer<T extends Laya.View> extends ViewBase {
    constructor(container: T) {
        super();
        this.container = container;
    }
    protected inited: boolean = false;
    protected _container: T;
    public set container(v: T) {
        this._container = v;
    }
    public get container(): T { return this._container; }
    public initContainer(args?: unknown): void {
        if (this.inited) return;
        this.inited = true;
        this.onAwake();
        this.initModelEvent();
    }
    public destoryContainer(): boolean {
        if (this._container != null) {
            this._container.destroy();
            this._container = null;
            return true;
        }
        return false;
    }
    onDestroy(): void {
        if (this._container != null && !this._container.destroyed) {
            this._container.destroy();
            this._container = null;
        }
        super.onDestroy();
    }
}
