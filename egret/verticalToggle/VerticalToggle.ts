/**
 * class name : VerticalToggle
 * class description : 垂直toggle组件(无默认皮肤，使用时指定皮肤)，此类只负责显示，不储存数据。
 * @author : ran
 * time : 2021.06.16
 */
class VerticalToggle extends eui.Component {

    /**
     * 设置初始状态，默认是不展开的
     * @param isShow 
     */
    public constructor(isShow = false) {
        super();
        this._isShow = isShow
    }

    /**
     * 初始化数据
     * @param renderer 
     * @param strs 展开条目的数组
     * @param selectCB 选择子项后的回调，回传当前点击的子项的index
     * @param defaultIndex 锁定的条目，默认0
     * @param showRotation 展开时，箭头的转角，默认0
     * @param hideRotation 闭合时，箭头的转角，默认180
     */
    public initToggle(renderer: any, strs: string[], selectCB: Function, thisObj: any, defaultIndex = 0, showRotation = 180, hideRotation = 0) {
        this.list.itemRenderer = renderer
        this.childrenDatas = strs
        this.list.dataProvider = new eui.ArrayCollection(this.childrenDatas);
        this.list.selectedIndex = defaultIndex;
        this._selectedIndex = defaultIndex
        this.list.validateNow();
        this.label.text = this.childrenDatas[defaultIndex];

        this.selectCB = selectCB
        this.selectCBThisObj = thisObj

        this.showRotation = showRotation
        this.hideRotation = hideRotation
    }

    /** 主按钮组(皮肤必须有) */
    protected mainGroup: eui.Group;
    /** 主按钮背景图，主要用于定位使用(皮肤必须有) */
    protected background: eui.Image;
    /** 主按钮上的箭头图片(皮肤必须有) */
    protected arrow: eui.Image;
    /** 主按钮上的文本(皮肤必须有) */
    protected label: eui.Label;
    /** toggle按钮list(皮肤必须有) */
    protected list: eui.List;
    /** 范围外的点击遮罩，用来检测点击其他区域的(皮肤必须有) */
    protected outTouchGroup: eui.Group;

    /** 服务于缓动动画，由于list无法修改height，通过一个容器作为遮罩 */
    protected tweenMask: eui.Rect;
    protected childrenDatas: string[];
    protected _selectedIndex: number = -1;
    public get selectedIndex() { return this._selectedIndex; }
    // 展开时箭头角度
    private showRotation = 180
    // 闭合时箭头角度
    private hideRotation = 0
    // 选择子项后的回调
    private selectCB: Function
    private selectCBThisObj: any

    /** 状态是否为展开 */
    private _isShow = false
    public set isShow(isShow: boolean) {
        if (this._isShow != isShow) {
            if (isShow) {
                this.show()
            }
            else {
                this.hide()
            }
        }
    }
    public get isShow() {
        return this._isShow
    }

    protected childrenCreated() {
        super.childrenCreated()
        if (this._isShow) {
            this.show();
        }
        else {
            this.hide()
        }
        this.list.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onRenderClick, this);
        this.mainGroup.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onClick, this);
        this.outTouchGroup.addEventListener(egret.TouchEvent.TOUCH_TAP, this.hide, this);
    }

    protected onRenderClick() {
        let nowIndex = this.list.selectedIndex;
        if (nowIndex == this._selectedIndex) return;
        this._selectedIndex = nowIndex;
        this.label.text = this.childrenDatas[this._selectedIndex];
        this.selectCB.call(this.selectCBThisObj, nowIndex)
        this.onClick();
    }

    protected onClick() {
        if (this._isShow) {
            this.hide();
        } else {
            this.show();
        }
    }

    protected show() {
        this._isShow = true
        this.setOutTouchGroup();
        if (this._tween) {
            this.list.touchEnabled = false;
            egret.Tween.removeTweens(this.tweenMask);

            // 箭头缓动
            // egret.Tween.removeTweens(this.arrow);
            // egret.Tween.get(this.arrow).to({rotation: this.showRotation}, this.tweenTime);
            this.arrow.rotation = this.showRotation

            egret.Tween.get(this.tweenMask).to({ height: this.list.contentHeight }, this.tweenTime).call(this.tweenComplete, this, [true]);
        } else {
            this.arrow.rotation = this.showRotation
            this.list.visible = true;
            this.list.touchEnabled = true;
        }
    }

    // protected quickShow() {
    //     this.arrow.rotation = this.showRotation
    //     this.list.visible = true;
    //     this.list.touchEnabled = true;
    // }

    protected hide() {
        this._isShow = false
        this.setOutTouchGroup();
        if (this._tween) {
            this.touchEnabled = false;
            egret.Tween.removeTweens(this.tweenMask);

            // 箭头缓动
            // egret.Tween.removeTweens(this.arrow);
            // egret.Tween.get(this.arrow).to({rotation: this.hideRotation}, 200);
            this.arrow.rotation = this.hideRotation

            egret.Tween.get(this.tweenMask).to({ height: 0 }, 200).call(this.tweenComplete, this, [false]);
        } else {
            this.arrow.rotation = this.hideRotation
            this.list.visible = false;
            this.list.touchEnabled = false;
        }
    }

    // protected quickHide() {
    //     this.arrow.rotation = this.hideRotation
    //     this.list.visible = false;
    //     this.list.touchEnabled = false;
    // }

    /**
     * 强制选择子项
     * @param index 子项的位置
     * @param triggerSelectedCB 是否触发选择回调，默认不触发
     */
    public forceChangeIndex(index: number, triggerSelectedCB = false) {
        if (index == this._selectedIndex) {
            return;
        }
        this.list.selectedIndex = index
        this._selectedIndex = index;
        this.label.text = this.childrenDatas[this._selectedIndex];
        if (triggerSelectedCB) {
            this.selectCB.call(this.selectCBThisObj, index)
        }
    }

    /** 缓动动画的时间ms */
    public tweenTime: number = 200;

    public _tween: boolean = false;
    /** 是否开启缓动动画 */
    public set tween(bool: boolean) {
        this._tween = bool;
        if (this._tween) {
            if (!this.tweenMask) this.tweenMask = new eui.Rect();
            this.addChild(this.tweenMask);
            this.list.left != null ? this.tweenMask.left = this.list.left : this.tweenMask.x = this.list.x;
            if (this.list.right != null) this.tweenMask.right = this.list.right;
            this.tweenMask.y = this.list.y;
            this.tweenMask.width = this.list.width;
            this.tweenMask.height = !this._isShow ? 0 : this.list.height;
            this.list.mask = this.tweenMask;
            this.list.visible = true;
        } else {
            this.list.mask = null;
            if (this.tweenMask) {
                this.removeChild(this.tweenMask);
            }
        }
    }

    protected tweenComplete(show: boolean) {
        if (show) {
            this.list.touchEnabled = true;
        }
    } 


    protected setOutTouchGroup() {
        if(this._isShow) {
            this.addChildAt(this.outTouchGroup, 0);
        } else {
            this.removeChild(this.outTouchGroup);
        }
    }


    protected onOutTouchClick() {

    }





    //class end
}