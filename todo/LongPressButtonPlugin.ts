module mvc {
    /**
     * @class: LongPressButtonPlugin
     * @description: 长按按钮插件
     * @author: Ran
     * @time: 2024-12-10 09:29:09
     */
    export class LongPressButtonPlugin {


        protected _button: Laya.Sprite;
        public get button(): Laya.Sprite { return this._button; };
        protected _buttonHandler: Laya.Handler;
        protected _pressed: boolean;
        protected _longActived: boolean;
        /** 长按执行间隔，单位毫秒 */
        protected _executeInterval: number;
        protected _executeTimer: number;


        /**
         * 
         * @param button - 点击对象，自行保证没有其他的点击事件，否则会重复执行
         * @param handler - 点击回调事件，执行时会带一个Laya.Event类型参数
         * @param interval - 长按执行间隔，缺省500ms
         */
        constructor(button: Laya.Sprite, handler: Laya.Handler, interval: number = 500) {
            this._button = button;
            this._buttonHandler = handler;
            this._pressed = false;
            this._longActived = false;
            this._executeInterval = interval;
            this._executeTimer = 0;
            this.active(true);
        }


        public active(bool: boolean): void {
            if (bool) {
                this._button.on(Laya.Event.MOUSE_DOWN, this, this._onMouseDown);
            } else {
                this._reset();
            }
        }


        protected _onMouseDown(): void {
            this._pressed = true;
            this._addEvents();
        }


        protected _onMouseUp(): void {
            if (!this._longActived) this._execute();
            this._reset();
        }


        protected _onMouseOut(): void {
            this._reset();
        }


        protected _onUpdate(): void {
            let delta = Laya.timer.delta;
            if (this._executeTimer >= this._executeInterval) {
                this._longActived = true;
                this._executeTimer = 0;
                this._execute();
            }
            this._executeTimer += delta;
        }


        protected _execute(): void {
            if (this._buttonHandler == null) return;

            let event = new Laya.Event();
            event.target = this._button;
            event.currentTarget = this._button;
            this._buttonHandler.runWith(event);
        }


        protected _reset(): void {
            this._longActived = false;
            this._pressed = false;
            this._executeTimer = 0;
            this._removeEvents();
        }


        protected _addEvents(): void {
            if (!Laya.timer.hasTimer(this, this._onUpdate))
                Laya.timer.frameLoop(1, this, this._onUpdate);
            this._button.on(Laya.Event.MOUSE_UP, this, this._onMouseUp);
            this._button.on(Laya.Event.MOUSE_OUT, this, this._onMouseOut);
        }


        protected _removeEvents(): void {
            if (Laya.timer.hasTimer(this, this._onUpdate))
                Laya.timer.clear(this, this._onUpdate);
            this._button.off(Laya.Event.MOUSE_UP, this, this._onMouseUp);
            this._button.off(Laya.Event.MOUSE_OUT, this, this._onMouseOut);

        }


        public destroy(): void {
            if (this._buttonHandler != null) {
                this._buttonHandler.clear();
                this._buttonHandler = null;
            }
            this._button = null;
            this._reset();
        }


        // class end
    }


    /**
     * @class: LongPressButtonPluginGroup
     * @description: 长按按钮插件组，用于多个长按按钮的时候
     * @author: Ran
     * @time: 2024-12-10 10:45:18
     */
    export class LongPressButtonPluginGroup {


        protected _plugins: { [id: number]: LongPressButtonPlugin };


        constructor() {
            this._plugins = {};
        }


        public addClick(button: Laya.Sprite, handler: Laya.Handler, interval: number = 500): void {
            let id = button["$_GID"];
            if (id == null) return;
            this._plugins[id] = new LongPressButtonPlugin(button, handler, interval);
        }


        public removeClick(button: Laya.Sprite): void {
            let id = button["$_GID"];
            if (id == null) return;
            this._plugins[id].destroy();
            delete this._plugins[id];
        }


        public removeAllClick(): void {
            for (let id in this._plugins) {
                this.removeClick(this._plugins[id].button);
            }
        }


        public destroy(): void {
            this.removeAllClick();
        }


    }


    // module end
}
