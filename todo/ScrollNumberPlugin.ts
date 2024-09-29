module mvc {
    export enum ScrollSingleNumberType {
        NONE,

        number,
        char,

        COUNT,
    }

    /**
     * @class: ScrollNumberPlugin
     * @description: 滚动数字插件
     * @author: Ran
     * @time: 2024-09-13 14:29:21
     */
    export class ScrollNumberPlugin {


        protected _numbers: ScrollSingleNumberPlugin[] = [];
        protected _numberPool: ScrollSingleNumberPlugin[] = [];
        protected _parent: Laya.Sprite;

        protected _startValue: number;
        protected _endValue: number;
        /** 数字偏移方向，缺省右对齐 */
        protected _numberLayoutDirection: number = -1;
        /** 高位与低位总时长的偏移值，主要用来模仿进位的效果
        *   PS: 不能直接用仿真现实机械进制表的效果，变化值过大导致动画过长 */
        protected _startOffsetTime: number = 100;
        /** 数字默认开始时长 */
        protected _defaultDuration: number = 75;
        /** 模仿进位的效果 */
        protected _carryBitLikeON: boolean = true;
        protected _labelStyle: LabelStyle;


        constructor(parent: Laya.Sprite, value: number) {
            this._parent = parent;
            this._startValue = value;
            let numStr = value.toString();
            let len = numStr.length;
            this._addNumbers(len);
            for (let i = 0; i < numStr.length; i++) {
                this._numbers[i].value = parseInt(numStr[i]);
            }
            // Laya.timer.frameLoop(1, this, this._onUpdate);
        }


        protected _addNumbers(count: number): void {
            let len = this._numbers.length + count;
            for (let i = this._numbers.length; i < len; i++) {
                let nnn = this._generateNumber();
                nnn.add();
                this._numbers.push(nnn);
            }
            this._layout();
        }


        protected _removeNumbers(count: number): void {
            count = Math.min(count, this._numbers.length);
            for (let i = 0; i < count; i++) {
                let nnn = this._numbers.pop();
                this._recycleNumber(nnn);
            }
            this._layout();
        }


        protected _tagRemoveNumbers(count: number): void {
            count = Math.min(count, this._numbers.length);
            for (let i = 0; i < count; i++) {
                let nnn = this._numbers[i];
                this._tagRecycleNumber(nnn);
                nnn.type = ScrollSingleNumberType.number;
            }
            this._layout();
        }


        protected _layout(): void {
            if (this._numbers.length <= 0) return;
            let startX = this.width;
            for (let i = 0; i < this._numbers.length; i++) {
                let nnn = this._numbers[i];
                let previous = this._numbers[i - 1];
                let width = 0;
                let x = startX * this._numberLayoutDirection;
                if (previous != null) {
                    x = previous.x;
                    width = previous.width;
                }
                nnn.x = x + width;
            }
        }


        public get width(): number {
            let width = 0;
            for (let i = 0; i < this._numbers.length; i++) {
                width += this._numbers[i].width;
            }
            return width;
        }


        protected _generateNumber(value: number = 0): ScrollSingleNumberPlugin {
            let nnn = this._numberPool.pop();
            if (nnn == null) {
                nnn = new ScrollSingleNumberPlugin(this._parent, value);
                if (this._labelStyle != null) nnn.setLabelStyle(this._labelStyle);
            }
            nnn.completeRecycle = false;
            return nnn;
        }


        protected _recycleNumber(nnn: ScrollSingleNumberPlugin, index?: number): void {
            nnn.recycle();
            if (index == null) {
                for (let i = this._numbers.length - 1; i >= 0; i--) {
                    let _n = this._numbers[i];
                    if (nnn == _n) {
                        this._numbers.splice(i, 1);
                        break;
                    }
                }
            } else {
                this._numbers.splice(index, 1);
            }
            this._numberPool.push(nnn);
        }


        protected _tagRecycleNumber(nnn: ScrollSingleNumberPlugin): void {
            nnn.completeRecycle = true;
        }


        protected _prepare(): void {
            // if (this._startValue == this._endValue) return;
            let startValue = mgr.toolsMgr.overLength(this._startValue);
            let endValue = mgr.toolsMgr.overLength(this._endValue);
            let diff = endValue.length - startValue.length;
            let count = Math.abs(diff);
            if (diff > 0) {
                this._addNumbers(count);
            } else {
                if (this._endValue > 0) this._removeNumbers(count);
                else this._tagRemoveNumbers(count);
                // this._removeNumbers(count);
            }
        }


        public roll(startValue: number, endValue: number): void {
            this._startValue = startValue;
            this._endValue = endValue;
            this._prepare();
            let _endValue = mgr.toolsMgr.overLength(this._endValue);
            let _startValue = mgr.toolsMgr.overLength(this._startValue);
            let numStr = _endValue;
            if (this._endValue <= 0) numStr = _startValue;
            let len = numStr.length;
            if (this._carryBitLikeON) {
                if (this._endValue > 0) {
                    for (let i = len - 1; i >= 0; i--) {
                        let _number = this._numbers[i];
                        let _value = numStr[i];
                        let type = this.checkValueType(_value);
                        if (type == ScrollSingleNumberType.number) {
                            let ev = parseInt(_value);
                            let low = this._getLowNumber(i + 1);
                            if (low == null) _number.duration = this._defaultDuration;
                            else {
                                let highTotalDuration = low.totalDuration + this._startOffsetTime;
                                _number.duration = highTotalDuration / _number.calculateChangeCount(ev);
                            }
                            _number.start(ev);
                        } else {
                            _number.start(_value);
                        }
                    }
                } else {
                    for (let i = 0; i < len; i++) {
                        let _number = this._numbers[i];
                        let _value = numStr[i];
                        let type = this.checkValueType(_value);
                        if (type == ScrollSingleNumberType.number) {
                            let ev = parseInt(_value);
                            if (this._endValue <= 0) ev = 0;
                            let high = this._getHighNumber(i - 1);
                            if (high == null) _number.duration = this._defaultDuration;
                            else {
                                let highTotalDuration = high.totalDuration + this._startOffsetTime;
                                _number.duration = highTotalDuration / _number.calculateChangeCount(ev);
                            }
                            _number.start(ev);
                        } else {
                            _number.start(_value);
                        }
                    }
                }
            } else {
                for (let i = 0; i < len; i++) {
                    let _number = this._numbers[i];
                    let _value = numStr[i];
                    let type = this.checkValueType(_value);
                    if (type == ScrollSingleNumberType.number) {
                        let ev = parseInt(numStr[i]);
                        _number.duration = this._defaultDuration;
                        _number.start(ev);
                    } else {
                        _number.start(_value);
                    }
                }
            }
            this._layout();
            if (!Laya.timer.hasTimer(this, this._onUpdate))
                Laya.timer.frameLoop(1, this, this._onUpdate);
        }


        public rollTo(endValue: number): void {
            let complete = this._checkAllNumberComplete();
            if (!complete) {
                this._startValue = this._endValue;
            }
            this.roll(this._startValue, endValue);
        }


        protected _getLowNumber(index: number): ScrollSingleNumberPlugin {
            for (let i = index; i < this._numbers.length; i++) {
                if (this._numbers[i].type == ScrollSingleNumberType.number) {
                    return this._numbers[i];
                }
            }
            return null;
        }


        protected _getHighNumber(index: number): ScrollSingleNumberPlugin {
            for (let i = index; i >= 0; i--) {
                let n = this._numbers[i];
                if (n == null) continue;
                if (this._numbers[i].type == ScrollSingleNumberType.number) {
                    return this._numbers[i];
                }
            }
            return null;
        }


        public set value(v: number) {
            this._endValue = v;
            this._prepare();
            for (let i = this._numbers.length - 1; i >= 0; i--) {
                if (this._numbers[i].completeRecycle)
                    this._recycleNumber(this._numbers[i], i);
            }
            let value = mgr.toolsMgr.overLength(this._endValue);
            for (let i = 0; i < value.length; i++) {
                let _value = value[i];
                let _number = this._numbers[i];
                let type = this.checkValueType(_value);
                if (type == ScrollSingleNumberType.number)
                    _number.value = parseInt(_value);
                else _number.value = _value;
            }
            this._layout();
            this._startValue = this._endValue;
        }


        public checkValueType(v: string): ScrollSingleNumberType {
            let regex = /[0-9]/gm;
            if (regex.test(v)) return ScrollSingleNumberType.number;
            return ScrollSingleNumberType.char;
        }


        protected _onUpdate(): void {
            let complete = true;
            for (let i = 0; i < this._numbers.length; i++) {
                let num = this._numbers[i];
                if (num.tweening) complete = false;
                num.onUpdate();
            }
            if (complete) this._onComplete();
        }


        protected _checkAllNumberComplete(): boolean {
            let complete = true;
            for (let i = 0; i < this._numbers.length; i++) {
                let num = this._numbers[i];
                if (num.tweening) complete = false;
            }
            return complete;
        }


        protected _onComplete(): void {
            Laya.timer.clearAll(this);
            for (let i = this._numbers.length - 1; i >= 0; i--) {
                let n = this._numbers[i];
                if (n.completeRecycle)
                    this._recycleNumber(n, i);
            }
            if (this._endValue <= 0) {
                this._numbers[0].type = ScrollSingleNumberType.number;
                this._numbers[0].value = 0;
            }
            this._startValue = this._endValue;
        }


        public printNumberFields(field: keyof ScrollSingleNumberPlugin): void {
            for (let i = 0; i < this._numbers.length; i++) {
                console.log(` ===== ${i} ${this._numbers[i][field]} ===== `);
            }
        }


        public setLabelStyle(style: LabelStyle): void {
            this._labelStyle = style;
            for (let i = 0; i < this._numbers.length; i++) {
                this._numbers[i].setLabelStyle(style);
            }
        }


        destroy(): void {
            for (let i = 0; i < this._numbers.length; i++) {
                let n = this._numbers[i];
                n.destroy();
            }
            for (let i = 0; i < this._numberPool.length; i++) {
                this._numberPool[i].destroy();
            }
            this._parent = null;
        }


        // class end
    }


    /**
     * @class: ScrollSingleNumberPlugin
     * @description: 滚动单个数字插件
     * @author: Ran
     * @time: 2024-09-13 14:47:55
     */
    export class ScrollSingleNumberPlugin {


        public duration: number = 100;
        public completeRecycle: boolean = false;
        public type: ScrollSingleNumberType = ScrollSingleNumberType.number;


        protected _parent: Laya.Sprite;
        protected _x: number;


        protected _direction: number = 1;
        protected _endValue: number = 0;
        protected _currentValue: number = 0;


        protected _distance: number = 30;
        protected _yVelocity: number = 1;
        protected _alphaVelocity: number = 0.1;
        protected _top: Laya.Label;
        protected _bottom: Laya.Label;
        protected _gap: number = 0;
        // protected _onceDuration: number;
        protected _totalDuration: number;
        public get totalDuration(): number { return this._totalDuration; }
        // protected _changeCount: number;
        // public get changeCount(): number { return this._changeCount; }

        protected _tweening: boolean = false;
        public get tweening(): boolean { return this._tweening; }


        constructor(parent: Laya.Sprite, value: number) {
            this._parent = parent;
            this._top = new Laya.Label();
            this._top.fontSize = 36;
            this._bottom = new Laya.Label();
            this._bottom.fontSize = 36;
            this._top.text = value.toString();
            this._bottom.text = value.toString();
            this._currentValue = value;
            this._endValue = value;
            this.add();
        }


        public set x(x: number) {
            this._x = x;
            this._top.x = this._x;
            this._bottom.x = this._x;
        }


        public get x(): number {
            return this._x;
        }


        public get width(): number {
            if (this._top == null) return 0;
            return this._top.width;
        }


        public get height(): number {
            if (this._top == null) return 0;
            return this._top.height;
        }


        public add(): void {
            if (this._parent == null) return;
            this._parent.addChild(this._top);
            this._parent.addChild(this._bottom);
            this._top.y = 0;
            this._bottom.y = this._top.y + this._top.height + this._gap;
            this._bottom.alpha = 0;
        }


        public set value(v: number | string) {
            if (typeof v == "number") {
                this.type = ScrollSingleNumberType.number;
                this._endValue = v;
                this._finish();
            } else {
                this.type = ScrollSingleNumberType.char;
                this._currentValue = this._endValue;
                this._tweening = false;
                this._analyze();
                this._top.text = v;
            }
        }


        protected _analyze(): void {
            let changeCount = this.calculateChangeCount(this._endValue);
            this._totalDuration = this.duration * changeCount;
            if (this._direction > 0) {
                if (this._top.y < this._bottom.y) {
                    let lb = this._bottom;
                    this._bottom = this._top;
                    this._top = lb;
                }

                this._top.y = 0;
                this._top.alpha = 1;
                this._bottom.y = this._top.y + this._top.height + this._gap;
                this._bottom.alpha = 0;
                // topValue == null ? this._top.text = this._currentValue + "" : this._top.text = topValue + "";
                this._top.text = this._currentValue + "";
                let bottomValue = this._currentValue + this._direction;
                if (bottomValue >= 10) bottomValue = 0;
                this._bottom.text = bottomValue + "";
            } else {
                if (this._top.y < this._bottom.y) {
                    let lb = this._bottom;
                    this._bottom = this._top;
                    this._top = lb;
                }
                this._bottom.y = 0;
                this._bottom.alpha = 1;
                this._top.y = this._bottom.y - this._bottom.height - this._gap;
                this._top.alpha = 0;
                this._bottom.text = this._currentValue + "";
                let topValue = this._currentValue + this._direction;
                if (topValue < 0) topValue = 9;
                this._top.text = topValue + "";
            }
            this._yVelocity = this._distance / this.duration;
            this._alphaVelocity = 1 / this.duration;
        }


        public calculateChangeCount(endValue: number): number {
            let changeCount = 10;
            let offset = endValue - this._currentValue;
            if (offset > 0) changeCount = offset;
            else changeCount = changeCount + offset;
            return changeCount;
        }


        public start(v: number | string): void {
            if (typeof v == "number") {
                this.type = ScrollSingleNumberType.number;
                this._endValue = v;
                if (this.completeRecycle) this._endValue = 0;
                this._analyze();
                this._tweening = true;
            } else {
                this.type = ScrollSingleNumberType.char;
                this._currentValue = this._endValue;
                this._tweening = false;
                this._analyze();
                this._top.text = v;
            }
        }


        public stop(): void {
            if (!this._tweening) return;
            this._tweening = false;
            // this._onOnceComplete();
        }


        public recycle(): void {
            if (this._parent == null) return;
            if (this._tweening) this.stop();
            if (this._top.parent != null) this._top.removeSelf();
            if (this._bottom.parent != null) this._bottom.removeSelf();
            // this.completeRecycle = false;
        }


        public onUpdate(): void {
            if (!this._tweening) return;
            let delta = Laya.timer.delta;
            let topAlphaCoefficient = 1;
            let bottomAlphaCoefficient = 1;
            if (this._direction > 0) {
                topAlphaCoefficient = -1;
                bottomAlphaCoefficient = 1;
            } else {
                topAlphaCoefficient = 1;
                bottomAlphaCoefficient = -1;
            }
            this._top.y += this._direction * -1 * delta * this._yVelocity;
            this._top.alpha += delta * this._alphaVelocity * topAlphaCoefficient;
            this._bottom.y += this._direction * -1 * delta * this._yVelocity;
            this._bottom.alpha += delta * this._alphaVelocity * bottomAlphaCoefficient;
            let _distance = Math.abs(this._top.y);
            if (this._direction < 0) {
                _distance = Math.abs(this._bottom.y);
            }
            if (_distance >= this._distance) {
                this._onOnceComplete();
            }
        }


        protected _onOnceComplete(): void {
            this._currentValue = this._currentValue + this._direction;
            if (this._direction > 0) {
                if (this._currentValue >= 10) this._currentValue = 0;
            } else {
                if (this._currentValue < 0) this._currentValue = 9;
            }
            if (this._currentValue == this._endValue) {
                this._onComplete();
            }
            this._analyze();
        }


        protected _onComplete(): void {
            this.stop();
            if (this.completeRecycle)
                this.recycle();
        }


        protected _finish(): void {
            this._onComplete();
            this._currentValue = this._endValue;
            this._analyze();
        }


        public setLabelStyle(style: LabelStyle): void {
            let keys = Object.keys(style);
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                if (style[key] != null) {
                    this._top[key] = style[key];
                    this._bottom[key] = style[key];
                }
            }
        }


        destroy(): void {
            this.stop();
            this._top = null;
            this._bottom = null;
        }


        // class end
    }


    // module end
}

