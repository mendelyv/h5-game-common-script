import disallowMultiple = cc._decorator.disallowMultiple;
const { ccclass, property } = cc._decorator;
/**
 * @class name : ScrollViewController
 * @description : scrollView控制器，主要用于渲染对象复用。
 * 数据更新使用data的set方法，如直接赋值_data，会出现内容不会及时更新，并且未做数据对比。
 * 条目数据更新部分，默认使用条目同名脚本，支持条目预制体脚本缺省，如有不同名需求，请自行修改analyzeRenderScript方法或在updateContent中调整逻辑。
 * 条目更新函数renderUpdateFunction，会在更新内容时调用，需在条目控制脚本中实现填入的方法名，默认为updateData。
 * @author : Ran
 * @time : 2022.07.21
 */
@ccclass
// @ts-ignore
@disallowMultiple(true)
export default class ScrollViewController extends cc.Component {
    @property(cc.ScrollView)
    public scrollView: cc.ScrollView = null;
    @property({ type: cc.Prefab, displayName: "渲染预制体" })
    public render: cc.Prefab = null;
    @property({ type: cc.Integer, displayName: "行/列", tooltip: "多行/列渲染时使用" })
    public multiple: number = 1;
    @property(cc.Integer)
    public paddingTop: number = 0;
    @property(cc.Integer)
    public paddingBottom: number = 0;
    @property(cc.Integer)
    public paddingLeft: number = 0;
    @property(cc.Integer)
    public paddingRight: number = 0;
    @property(cc.Vec2)
    public gap: cc.Vec2 = new cc.Vec2(0, 0);
    @property({ type: cc.Integer, displayName: "交换节点", tooltip: "超出视野的渲染类行/列数，用于辅助滑动时渲染类交换，默认为2" })
    public spawnCount: number = 2;
    @property({ displayName: "条目更新函数", tooltip: "数据更新时渲染类更新回调，默认为updateData，需要在条目控制脚本中实现同名方法" })
    public renderUpdateFunction: string = "updateData";

    private inited: boolean;
    private _data: any;
    public set data(data: any) {
        // let range = this.getVisibleRange();
        // this.recycleRendersByRange(range);
        this.recycleAllRender();

        this._data = data;
        this.visibleRange[0] = this.visibleRange[1] = -1;
    }
    private itemPool: cc.NodePool;
    private content: cc.Node;
    private renderHeight: number = 10;
    private renderWidth: number = 10;
    /** view中可以显示的条目数 */
    private visibleItemCount: number;
    /** view中显示的条目始末索引 */
    private visibleRange: number[] = [-1, -1];
    /** 条目节点字典，key为索引，value为节点 */
    private renderIndexDictionary: { [key: number]: cc.Node } = {};

    onLoad() {
        this.init();
    }


    lateUpdate() {
        let range = this.getVisibleRange();
        if (this.checkNeedUpdate(range)) {
            this.recycleRendersByRange(range);
            this.updateContent(range);
        }
    }


    private init() {
        if (this.inited) return;
        this.inited = true;

        this._data = [];
        this.itemPool = new cc.NodePool();
        if (!this.scrollView) this.scrollView = this.node.getComponent(cc.ScrollView);
        if (!this.scrollView) {
            console.error(" ***** ScrollViewController: scrollView is null ***** ");
            return;
        }

        this.content = this.scrollView.content;
        this.removeAllRender();

        let render = cc.instantiate(this.render);
        if (render) {
            this.renderWidth = render.width;
            this.renderHeight = render.height;
            render.destroy();
        } else {
            console.error(" ***** ScrollViewController: render is null, please set in component panel or use setRender function ***** ");
        }

        let horizontal = this.scrollView.horizontal;
        this.visibleItemCount = horizontal ? Math.ceil((this.content.parent.width - this.paddingLeft - this.paddingRight) / (this.renderWidth + this.gap.x)) : Math.ceil((this.content.parent.height - this.paddingTop - this.paddingBottom) / (this.renderHeight + this.gap.y));
    }


    /**
     * 添加渲染预制体
     * @param prefab - 预制体
     */
    private setRender(prefab: cc.Prefab) {
        this.render = prefab;
    }


    /**
     * 更新scrollView的content内容
     * @param range - 更新的范围[start, end]
     */
    private updateContent(range: number[]) {
        if (!this.render) {
            console.error(" ***** ScrollViewController: render is null, please set in component panel or use setRender function ***** ");
            return;
        }

        this.calculateContentSize();
        for (let i = range[0]; i <= range[1]; i++) {
            let item = this.renderIndexDictionary[i] || this.itemPool.get();
            if (!item) {
                item = cc.instantiate(this.render);
                this.analyzeRenderScript(item);
            }
            item.removeFromParent(false);
            this.addRender(item, i);
            this.updateRender(item, this._data[i]);
            this.renderIndexDictionary[i] = item;
        }
    }


    /**
     * 调用条目控制脚本的更新方法
     * @param render - 要更新的节点
     * @param data - 数据
     */
    private updateRender(render: cc.Node, data: any) {
        let scriptName = this.render.name;
        let script = render.getComponent(scriptName);
        if (script[this.renderUpdateFunction]) {
            script[this.renderUpdateFunction](data);
        }
    }


    /**
     * 查看预制体是否需要挂载控制脚本
     * @param render - 需要挂载脚本的节点
     */
    private analyzeRenderScript(render: cc.Node) {
        let script = this.render.name;
        let has = render.getComponent(script) != null;
        if (!has) render.addComponent(script);
    }


    /* 计算content大小，并修改 */
    private calculateContentSize() {
        let horizontal = this.scrollView.horizontal;
        if (horizontal)
            this.content.width = Math.ceil(this._data.length / this.multiple) * (this.renderWidth + this.gap.x) - this.gap.x + this.paddingLeft + this.paddingRight;
        else
            this.content.height = Math.ceil(this._data.length / this.multiple) * (this.renderHeight + this.gap.y) - this.gap.y + this.paddingTop + this.paddingBottom;
    }


    /**
     * 添加渲染节点
     * @param render - 添加的节点
     * @param index - 添加的位置索引
     */
    private addRender(render: cc.Node, index?: number) {
        if (index == null) index = this.content.children.length;
        this.content.addChild(render);
        let horizontal = this.scrollView.horizontal;
        let row = 0, col = 0;
        row = horizontal ? index % this.multiple : Math.floor(index / this.multiple);
        col = horizontal ? Math.floor(index / this.multiple) : index % this.multiple;
        let gap = horizontal ? this.gap.x : this.gap.y;
        // 方向辅助参数
        let duration = new cc.Vec2(0, 0);
        duration.x = horizontal ? 1 : 0;
        duration.y = horizontal ? 0 : 1;
        if (!horizontal && this.multiple > 1) duration.x = 1;
        if (horizontal && this.multiple > 1) duration.y = 1;
        let x = (render.width * (render.anchorX + col)) * duration.x + this.paddingLeft + gap * col - this.content.width * this.content.anchorX + render.anchorX * render.width - this.content.width * this.content.anchorX;
        let y = (render.height * (1 - render.anchorY + row)) * duration.y + this.paddingTop + gap * row - this.content.height * (1 - this.content.anchorY);
        y *= -1;
        render.setPosition(x, y);
    }


    /* 移除并销毁scrollView的content中的所有节点 */
    private removeAllRender() {
        for (let i = 0; i < this.content.children.length; i++) {
            let c = this.content.children[i];
            this.content.removeChild(c);
            c.destroy();
        }
    }


    /* 回收scrollView的content中的所有节点 */
    private recycleAllRender() {
        for (let i = this.content.children.length - 1; i >= 0; i--) {
            let c = this.content.children[i];
            c.removeFromParent(false)
            this.itemPool.put(c);
        }
        this.renderIndexDictionary = {};
    }


    /**
     * 获取scrollView显示的始末索引范围
     * @returns [start, end] 显示的始末索引
     */
    private getVisibleRange() {
        if (!this._data)
            return [0, 0];

        let scrollOffset = this.scrollView.getScrollOffset();
        let start = 0;
        let horizontal = this.scrollView.horizontal;
        start = horizontal ? Math.floor(-scrollOffset.x / (this.renderWidth + this.gap.x)) - 1 : Math.floor(scrollOffset.y / (this.renderHeight + this.gap.y)) - 1;
        start = start < 0 ? 0 : start;
        let end = this.multiple * (start + this.visibleItemCount + this.spawnCount);
        end = end > this._data.length ? this._data.length - 1 : end;
        return [start, end];
    }


    /**
     * 回收一个范围中的所有节点
     * @param range - [start, end] 需要回收的索引范围
     */
    private recycleRendersByRange(range: number[]) {
        if (!range || range.length < 2)
            return;
        for (let i = this.visibleRange[0]; i < range[0]; i++) {
            if (i < 0 || !this.renderIndexDictionary[i])
                continue;
            this.itemPool.put(this.renderIndexDictionary[i]);
            this.renderIndexDictionary[i] = null;
        }
        for (let i = this.visibleRange[1]; i > range[1]; i--) {
            if (i < 0 || !this.renderIndexDictionary[i])
                continue;
            this.itemPool.put(this.renderIndexDictionary[i]);
            this.renderIndexDictionary[i] = null;
        }
        this.visibleRange[0] = range[0];
        this.visibleRange[1] = range[1];
    }


    private checkNeedUpdate(range: number[]) {
        return range && this.visibleRange && (this.visibleRange[0] != range[0] || this.visibleRange[1] != range[1]);
    }



}
