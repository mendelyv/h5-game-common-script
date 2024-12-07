export class PopTipPlugin {


    protected _container: Laya.View;
    protected _layoutNode: unknown;

    protected _auxiliary: PopTipPluginAuxiliary;


    constructor(ui: Laya.View, layoutNode: unknown) {
        this._container = ui;
        this._layoutNode = layoutNode;
    }


    public setPosition(mousePosition: Laya.Point): void {
        let c = this._container;
        c.x = mousePosition.x - sg.uimgr.rootNode.x;
        c.y = mousePosition.y;
        this._layoutWidth();
        this._layoutHeight();
    }


    public setAuxiliary(auxiliary: PopTipPluginAuxiliary): void
    public setAuxiliary(...args: [keyof PopTipPluginAuxiliary, unknown]): void
    public setAuxiliary(value: unknown): void {
        if (this._auxiliary == null) this._auxiliary = new PopTipPluginAuxiliary();
        if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
                let key = value[i][0];
                this._auxiliary[key] = value[i][1];
            }
        } else {
            this._auxiliary = value as PopTipPluginAuxiliary;
        }
    }


    protected _layoutWidth(): void {
        let c = this._container;
        let totalWidth = c.x + c.width;
        let offset = sg.uimgr.rootNode.x;
        if (totalWidth > Laya.stage.designWidth) {
            let layoutNode = this._layoutNode as Laya.Box;
            if (layoutNode.scaleX > 0) layoutNode.scaleX *= -1;
            layoutNode.x = Math.abs(layoutNode.width);
            c.x -= c.width;
            c.x -= offset;
            if (this._auxiliary != null) {
                if (this._auxiliary.widthLayoutOffset != null)
                    c.x -= this._auxiliary.widthLayoutOffset;
            }
        }
    }


    protected _layoutHeight(): void {
        let c = this._container;
        let totalHeight = c.y + c.height;
        if (totalHeight > Laya.stage.height) {
            let layoutNode = this._layoutNode as Laya.Box;
            if (layoutNode.scaleY > 0) layoutNode.scaleY *= -1;
            layoutNode.y = Math.abs(layoutNode.height);
            c.y -= c.height;
            if (this._auxiliary != null) {
                if (this._auxiliary.heightLayoutOffset != null)
                    c.y -= this._auxiliary.heightLayoutOffset;
            }
        }
    }


    public destroy(): void {
        this._container = null;
        this._layoutNode = null;
    }


    // class end
}


export class PopTipPluginAuxiliary {
    /** 宽度适配偏移 */
    public widthLayoutOffset: number;
    /** 高度适配偏移 */
    public heightLayoutOffset: number;
}
