module mvc {
    export interface IUnitBaseTweenTab {
        /** 选中图片 */
        imgSelected: Laya.Image;
        /** 文本组 */
        boxLabel?: Laya.Box;
        /** 装饰图组 */
        boxImage?: Laya.Box;
    }
    /**
     * @class: UnitBaseContainerTweenTab
     * @description: 缓动tab容器基类
     * @author: Ran
     * @time: 2024-08-27 11:12:03
     */
    export abstract class UnitBaseContainerTweenTab<T extends Laya.View & IUnitBaseTweenTab> extends sg.ViewBaseWithContainer<T> {


        /** 开启缓动 */
        public tween: boolean = true;
        /** 缓动速度 */
        public tweenVelocity: number = 0.7;


        protected _selectedIndex: number = 0;
        /** 辅助box父节点 */
        protected _box: Laya.Box;
        /** 辅助box */
        protected _boxes: Laya.Box[];
        /** boxLabel中的文本 */
        protected _labels: Laya.Label[];
        /** boxLabel中的图片 */
        protected _images: Laya.Image[];
        protected _dataProvider: unknown[];


        // ===== auxiliaries =====
        /** 间距，上下左右 */
        protected _padding: Laya.Vector4 = new Laya.Vector4(0, 0, 0, 0);
        /** 未选择宽度 */
        protected _unselectedSize: number;
        /** imgSelected宽度 */
        protected abstract _selectedSize: number;
        /** boxImage按钮装饰图宽度 */
        protected _imageWidth: number = 0;
        /** imgSelected的子节点索引 */
        protected _imgSelectedChildIndex: number = 1;
        /** 间隔 */
        protected _gap: number = 0;
        protected _decoratorGap: number = 0;
        // ===== auxiliaries =====


        /** tween开始前回调 */
        protected _beforeHandler: Laya.Handler;
        /** tween结束后回调 */
        protected _afterHandler: Laya.Handler;


        public initContainer(args?: unknown): void {
            super.initContainer(args);
            this._initLabels();
            this._initImages();
            this._initBox();
        }


        public set selectedIndex(value: number) {
            if (this._selectedIndex == value) return;
            this._selectedIndex = value;
            this.update();
        }


        public get selectedIndex() { return this._selectedIndex; };


        public set dataProvider(value: unknown[]) {
            this._dataProvider = value;
            this._calculateAuxiliaryBox();
            this._calculateBoxes();
            this._render();
            this.update();
        }


        public get dataProvider(): unknown[] { return this._dataProvider; };


        /** 初始化辅助box父节点 */
        protected _initBox(): void {
            this._box = new Laya.Box();
            this._box.width = this.container.width;
            this._box.height = this.container.height;
            this.container.addChildAt(this._box, this._imgSelectedChildIndex + 1);
        }


        protected _initLabels(): void {
            this._labels = [];
            if (this.container.boxLabel == null) return;
            for (let i = 0; i < this.container.boxLabel.numChildren; i++) {
                let label = this.container.boxLabel.getChildAt(i) as Laya.Label;
                this._labels.push(label);
            }
        }


        protected _initImages(): void {
            this._images = [];
            if (this.container.boxImage == null) return;
            for (let i = 0; i < this.container.boxImage.numChildren; i++) {
                let image = this.container.boxImage.getChildAt(i) as Laya.Image;
                this._images.push(image);
            }
        }


        protected _calculateAuxiliaryBox(): void { }


        protected _calculateBoxes(): void {
            this._boxes = [];
            this._box.removeChildren();
            if (this._selectedIndex > this._dataProvider.length - 1)
                this._selectedIndex = this._dataProvider.length - 1;
            for (let i = 0; i < this._dataProvider.length; i++) {
                let box = new Laya.Box();
                box.height = this._box.height - this._padding.x - this._padding.y;
                box.y = this._padding.x;
                box.width = this._selectedIndex == i ? this._selectedSize : this._unselectedSize;
                if (i > 0) {
                    let previous = this._boxes[i - 1];
                    box.x = previous.x + previous.width + this._gap;
                } else box.x = this._padding.z;
                box.on(Laya.Event.CLICK, this, this._onBoxClick);
                this._box.addChild(box);
                this._boxes.push(box);
            }
        }


        /** 渲染显示 */
        protected _render(): void { };


        public update() {
            this._updateUnselectedSize();
            // this._calculateBoxes();
            this._updateBoxes();
            this._updateLabels();
            this._updateImages();
            this._layoutLabelAndImage();
            this._updateImgSelected();
        }


        protected _updateImmediately(index: number): void {
            this._prepareTween();
            this._selectedIndex = index;
            if (this._beforeHandler != null)
                this._beforeHandler.runWith(this._selectedIndex);
            this.update();
            if (this._afterHandler != null)
                this._afterHandler.runWith(this._selectedIndex);
        }


        protected _updateUnselectedSize(): void {
            let totalWidth = this._box.width - this._padding.z - this._padding.w - this._selectedSize;
            let count = this._dataProvider.length - 1;
            totalWidth -= this._gap * count;
            this._unselectedSize = totalWidth / count;
        }


        protected _updateImgSelected(): void {
            let c = this.container;
            let selectedBox = this._boxes[this._selectedIndex];
            selectedBox.addChildAt(c.imgSelected, 0);
            c.imgSelected.x = 0;
            c.imgSelected.y = 0;
        }


        /** 根据所选下标更新辅助box的尺寸 */
        protected _updateBoxes(): void {
            for (let i = 0; i < this._boxes.length; i++) {
                let box = this._boxes[i];
                box.width = this._selectedIndex == i ? this._selectedSize : this._unselectedSize;
                if (i > 0) {
                    let previous = this._boxes[i - 1];
                    box.x = previous.x + previous.width + this._gap;
                } else box.x = this._padding.z;
            }
        }


        protected _updateLabels(): void {
            for (let i = 0; i < this._labels.length; i++) {
                let label = this._labels[i];
                let box = this._boxes[i];
                label.x = box.x + (box.width - label.width) / 2;
                label.y = box.y + (box.height - label.height) / 2;
            }
        }


        protected _updateImages(): void {
            for (let i = 0; i < this._images.length; i++) {
                let image = this._images[i];
                image.visible = i == this._selectedIndex;
            }
        }


        protected _layoutLabelAndImage(): void {
            let selectedLabel = this._labels[this._selectedIndex];
            let selectedImage = this._images[this._selectedIndex];
            if (selectedImage == null) return;
            let totalWidth = selectedLabel.width + this._imageWidth + this._decoratorGap;
            let box = this._boxes[this._selectedIndex];
            selectedImage.x = box.x + (box.width - totalWidth) / 2;
            selectedLabel.x = selectedImage.x + this._imageWidth + this._decoratorGap;
        }


        protected _prepareTween(): void {
            let c = this.container;
            c.addChildAt(c.imgSelected, this._imgSelectedChildIndex);
            let selectedBox = this._boxes[this._selectedIndex];
            c.imgSelected.x = selectedBox.x;
            c.imgSelected.y = selectedBox.y;
        }


        protected _startTween(): void {
            // 先调整好所有辅助box的位置
            this._updateBoxes();
            // 根据辅助box调整文本位置
            this._updateLabels();
            // 根据辅助box调整图片位置
            this._updateImages();
            this._layoutLabelAndImage();
            Laya.timer.frameLoop(1, this, this._onUpdate);
            this._box.mouseEnabled = false;
            if (this._beforeHandler != null)
                this._beforeHandler.runWith(this._selectedIndex);
        }


        protected _onUpdate(): void {
            let delta = Laya.timer.delta;
            let endBox = this._boxes[this._selectedIndex];
            let c = this.container;
            if (Math.abs(c.imgSelected.x - endBox.x) < this.tweenVelocity * delta) {
                this._onTweenComplete();
                return;
            }
            let direction = endBox.x - c.imgSelected.x > 0 ? 1 : -1;
            c.imgSelected.x += this.tweenVelocity * delta * direction;
        }


        protected _onTweenComplete(): void {
            Laya.timer.clear(this, this._onUpdate);
            this._box.mouseEnabled = true;
            this._updateImgSelected();
            if (this._afterHandler != null)
                this._afterHandler.runWith(this._selectedIndex);
        }


        protected _onBoxClick(e: Laya.Event): void {
            let target = e.currentTarget as Laya.Box;
            let selectedIndex = -1;
            for (let i = 0; i < this._boxes.length; i++) {
                if (target == this._boxes[i]) {
                    selectedIndex = i;
                    break;
                }
            }
            if (this._selectedIndex == selectedIndex) return;
            if (this.tween) {
                this._prepareTween();
                this._selectedIndex = selectedIndex;
                this._startTween();
            }
            else this._updateImmediately(selectedIndex);
        }


        public setBeforeHandler(handler: Laya.Handler): void {
            if (this._beforeHandler != null) {
                this._beforeHandler.clear();
                this._beforeHandler = null;
            }
            this._beforeHandler = handler;
        }


        public setAfterHandler(handler: Laya.Handler): void {
            if (this._afterHandler != null) {
                this._afterHandler.clear();
                this._afterHandler = null;
            }
            this._afterHandler = handler;
        }


        protected _showDebugGraphic(): void {
            for (let i = 0; i < this._boxes.length; i++) {
                let box = this._boxes[i];
                box.removeChildren();
                let graphic = new Laya.Sprite();
                box.addChild(graphic);
                graphic.graphics.drawRect(0, 0, box.width, box.height, "#676767");
            }
            this._updateImgSelected();
        }


        public onDestroy(): void {
            Laya.timer.clearAll(this);
            if (this._beforeHandler != null) {
                this._beforeHandler.clear();
                this._beforeHandler = null;
            }
            if (this._afterHandler != null) {
                this._afterHandler.clear();
                this._afterHandler = null;
            }
            super.onDestroy();
        }


        // class end
    }


    // module end
}

