module mvc {
    /**
     * @class: PopBaseOperationTip
     * @description: 可操作弹出框基类
     * @author: Ran
     * @time: 2024-08-05 18:19:58
     */
    export abstract class PopBaseOperationTip extends sg.ViewBase {


        public abstract boxBg: Laya.Box;
        public abstract lblTitle: Laya.Label;
        public abstract btnConfirm: Laya.Button;
        public abstract btnCancel: Laya.Button;
        public abstract lblContent: Laya.Label;
        public abstract lblHtmlContent: Laya.HTMLDivElement;
        public abstract boxContainer: Laya.Box;


        public dto: PopBaseOperationTipDto;


        // ===== auxiliaries =====
        protected _confirmButtonDefaultX: number;
        protected _cancelButtonDefaultX: number;
        // ===== auxiliaries =====


        protected abstract skinPath(): string;


        protected createChildren(): void {
            super.createChildren();
            this.loadScene(this.skinPath());
        }


        onAwake(): void {
            super.onAwake();
            this.btnConfirm.on(Laya.Event.CLICK, this, this._onConfirmClick);
            this.btnCancel.on(Laya.Event.CLICK, this, this._onCancelClick);
            this._confirmButtonDefaultX = this.btnConfirm.x;
            this._cancelButtonDefaultX = this.btnCancel.x;
        }


        initView(...args: [PopBaseOperationTipDto]): void {
            super.initView(args);
            if (this.dto != null) this._destroyDto();
            this.dto = args[0];
            this._initDto();
        }


        protected _initDto(): void {
            if (this.dto == null) this.dto = new PopBaseOperationTipDto();
            if (this.dto.topOffset == null) this.dto.topOffset = 70;
            if (this.dto.topGap == null) this.dto.topGap = 55;
            if (this.dto.bottomOffset == null) this.dto.bottomOffset = 83;
            if (this.dto.showConfirm == null) this.dto.showConfirm = true;
            if (this.dto.showCancel == null) this.dto.showCancel = true;
        }


        protected isHTML(): boolean {
            if (this.dto.content == null || this.dto.content.length <= 0) return false;
            const regex = /<\/?[a-z][a-z0-9]*[^<>]*>|<!--.*?-->/gm;
            let res = this.dto.content.match(regex);
            if (res != null && res.length > 0) return true;
            return false;
        }


        onEnable(): void {
            super.onEnable();
            this.update();
        }


        public update(): void {
            this._clean();
            let ishtml = this.isHTML();
            if (this.dto.container != null) {
                this._updateContainer();
            } else {
                if (ishtml) {
                    this._updateHTML();
                } else {
                    this._updateContent();
                }
            }
            this._updateTitle();
            this._updateButtons();
            this._layout();
        }


        protected _updateTitle(): void {
            if (this.dto.title == null) return;
            this.lblTitle.text = this.dto.title;
        }


        protected _updateButtons(): void {
            this.btnConfirm.visible = this.dto.showConfirm;
            this.btnCancel.visible = this.dto.showCancel;
            this.btnConfirm.x = this._confirmButtonDefaultX;
            this.btnCancel.x = this._cancelButtonDefaultX;
            if (!this.btnConfirm.visible && this.btnCancel.visible) {
                this.btnCancel.x = this._confirmButtonDefaultX;
            }
        }


        protected _updateHTML(): void {
            this.lblHtmlContent.visible = true;
            mgr.UIAssist.initHtml(this.lblHtmlContent, { size: 28, color: "#7a766b", wordWrap: true, width: this.lblContent.width, });
            this.lblHtmlContent.innerHTML = this.dto.content;
            this.lblHtmlContent.x = (this.width - this.lblHtmlContent.contextWidth) / 2 - (this.lblContent.width - this.lblHtmlContent.contextWidth) / 2;
        }


        protected _updateContent(): void {
            this.lblContent.visible = true;
            this.lblContent.text = this.dto.content;
        }


        protected _updateContainer(): void {
            this.boxContainer.visible = true;
            this.boxContainer.addChild(this.dto.container);
            this.boxContainer.width = this.dto.container.width;
            this.boxContainer.height = this.dto.container.height;
        }


        protected _clean(): void {
            this.lblContent.visible = false;
            this.boxContainer.visible = false;
            this.lblHtmlContent.visible = false;
        }


        protected _onConfirmClick(): void {
            this.closeSelf();
            if (this.dto.confirmHandler != null) {
                this.dto.confirmHandler.runWith(this.dto);
            }
        }


        protected _onCancelClick(): void {
            this.closeSelf();
            if (this.dto.cancelHandler != null) {
                this.dto.cancelHandler.runWith(this.dto);
            }
        }


        protected _layout(): void {
            let totalHeight = this.dto.topOffset + this.dto.topGap;
            let height = 0;
            if (this.dto.container != null && this.dto.container.parent != null) {
                height = this.boxContainer.height;
                this.boxContainer.y = totalHeight;
            } else {
                if (this.isHTML()) {
                    height = this.lblHtmlContent.contextHeight;
                    this.lblHtmlContent.y = totalHeight;
                } else {
                    height = this.lblContent.height;
                    this.lblContent.y = totalHeight;
                }
            }
            totalHeight = totalHeight + height + (this.dto.bottomGap != null ? this.dto.bottomGap : this.dto.topGap) + (this.dto.bottomOffset != null ? this.dto.bottomOffset : this.dto.topOffset);
            this.height = totalHeight;
            this.boxBg.height = totalHeight;
        }


        protected _destroyDto(): void {
            if (this.dto == null) return;
            if (this.dto.confirmHandler != null) {
                this.dto.confirmHandler.clear();
                this.dto.confirmHandler = null;
            }
            if (this.dto.cancelHandler != null) {
                this.dto.cancelHandler.clear();
                this.dto.cancelHandler = null;
            }
            if (this.dto.container != null) {
                this.dto.container.destroy();
                this.dto.container = null;
            }
            this.dto = null;
        }


        closeSelf(): void {
            if (this.dto.cancelHandler != null) {
                this.dto.cancelHandler.runWith(this.dto);
            }
            super.closeSelf();
        }


        onDestroy(): void {
            this._destroyDto();
            this.btnConfirm.off(Laya.Event.CLICK, this, this._onConfirmClick);
            this.btnCancel.off(Laya.Event.CLICK, this, this._onCancelClick);
            super.onDestroy();
        }


        // class end
    }


    export class PopBaseOperationTipDto {
        /** 顶部偏移，缺省70 */
        public topOffset?: number = 70;
        /** 顶部间隔，缺省55 */
        public topGap?: number = 55;
        /** 底部偏移，缺省83 */
        public bottomOffset?: number = 83;
        /** 底部间隔，缺省topGap一致 */
        public bottomGap?: number;
        /** 标题 */
        public title?: string;
        /** 确定按钮显示 */
        public showConfirm?: boolean = true;
        /** 取消按钮显示 */
        public showCancel?: boolean = true;
        /** 确认回调 */
        public confirmHandler?: Laya.Handler;
        /** 取消回调 */
        public cancelHandler?: Laya.Handler;
        /** 文本内容 */
        public content?: string;
        /** 皮肤内容 */
        public container?: sg.ViewBase;
    }

    //数据模板
    // let data = {} as PopBaseOperationTipDto;
    // data.title = "";
    // data.confirmHandler = new Laya.Handler(null, (dto) => { });
    // data.cancelHandler = new Laya.Handler(null, (dto) => { });
    // data.content = "";
    // data.container = sg.ViewBase;

    // module end
}

