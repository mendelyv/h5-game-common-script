import ScrollViewRender from "./ScrollViewRender";
import disallowMultiple = cc._decorator.disallowMultiple;
import Utils from "../../utils/Utils";
import { assetManager } from "../../assets/AssetManager";
const { ccclass, property } = cc._decorator;
/**
 * @class name : ScrollViewController
 * @description : scrollView控制器，主要用于渲染对象复用。
 * 数据更新使用data的set方法，如直接赋值_data，会出现内容不会及时更新，并且未做数据对比。
 * render数据更新部分，默认使用render同名脚本，支持render预制体脚本缺省，如有不同名需求，请自行修改analyzeRenderScript方法或在updateContent中调整逻辑。
 * 该组件会将scrollview中的view，content和render的锚点设置为左上角
 * TODO：全量调整改为部分调整，方便做显示回调
 * @author : Ran
 * @time : 2022.07.21
 */
@ccclass
@disallowMultiple()
export default class ScrollViewController extends cc.Component {


    // @property(cc.ScrollView)
    protected scrollView: cc.ScrollView = null;
    // @property({ type: cc.Prefab, displayName: "渲染预制体" })
    protected render: cc.Prefab = null;
    // @property({ type: cc.String, displayName: "渲染预制体控制脚本" })
    protected renderScript: unknown = null;
    @property({ type: cc.Integer, displayName: "行/列", tooltip: "多行/列渲染时使用" })
    public multiple: number = 1;
    /** 内容边距，格式为[x: 上，y: 下，z: 左，w: 右]，默认为[0,0,0,0] */
    @property({ type: cc.Vec4, tooltip: "内容边距，格式为 [x: 上，y: 下，z: 左，w: 右]，默认为 [0,0,0,0]" })
    public padding: cc.Vec4 = new cc.Vec4(0, 0, 0, 0);
    @property(cc.Vec2)
    public gap: cc.Vec2 = new cc.Vec2(0, 0);
    @property({ type: cc.Integer, displayName: "交换节点", tooltip: "超出视野的渲染类行/列数，用于辅助滑动时渲染类交换，默认为2" })
    public spawnCount: number = 2;


    protected inited: boolean;
    protected renderLoaded: boolean = false;
    protected _data: unknown[];
    public set data(data: unknown[]) {
        // let range = this.getVisibleRange();
        // this.recycleRendersByRange(range);
        if (!this.render && this.renderLoaded) {
            console.error(" ***** render is null, please set in component panel or use setRender function ***** ");
            return;
        }
        this._data = data;
        this.visibleIndexRange[0] = this.visibleIndexRange[1] = -1;
        this.onScrolling();
    }


    protected renderPool: cc.NodePool;
    protected content: cc.Node;
    protected renderHeight: number = 10;
    protected renderWidth: number = 10;
    /** view中可以显示的条目数 */
    protected visibleRenderCount: number;
    /** view中显示的条目始末索引 */
    protected visibleIndexRange: number[] = [-1, -1];
    /** 条目节点字典，key为索引，value为节点 */
    protected renderIndexDictionary: { [key: number]: cc.Node } = {};


    onLoad() {
        this.init();
    }


    // lateUpdate() {
    //     if (this.render == null || !this.renderLoaded) return;
    //     let range = this.getVisibleRange();
    //     if (this.checkNeedUpdate(range)) {
    //         this.recycleRendersByRange(range);
    //         this.updateContent(range);
    //     }
    // }


    protected init() {
        if (this.inited) return;
        this.inited = true;

        this._data = [];
        this.renderPool = new cc.NodePool();
        if (!this.scrollView) this.scrollView = this.node.getComponent(cc.ScrollView);
        if (!this.scrollView) {
            console.error(" ***** scrollView is null ***** ");
            return;
        }

        this.content = this.scrollView.content;
        if (this.content == null) {
            console.error(" ***** scrollView content is null ***** ");
            return;
        }
        this.content.anchorX = 0;
        this.content.anchorY = 1;
        let view = this.content.parent;
        view.anchorX = 0;
        view.anchorY = 1;
        this.initScrollEvent();
    }


    protected initScrollEvent() {
        this.scrollView.node.on("scrolling", this.onScrolling, this);
    }


    protected onScrolling() {
        if (this.render == null || !this.renderLoaded) return;
        let range = this.getVisibleRange();
        if (this.checkNeedUpdate(range)) {
            this.recycleRendersByRange(range);
            this.updateContent(range);
        }
    }


    /**
     * 添加渲染预制体
     * @param render - 预制体
     */
    public async setRender(render: cc.Prefab): Promise<void>;
    public async setRender(render: string): Promise<void>;
    public async setRender(render: unknown): Promise<void> {
        if (this.render != null) {
            this.render.destroy();
            this.render = null;
            this.renderLoaded = false;
        }
        if (render instanceof cc.Prefab)
            this.render = render;
        else if (typeof render == "string") {
            this.render = await assetManager.load<cc.Prefab>(render);
            this.renderLoaded = true;
        }
        this.initRender();
    }


    protected initRender(): void {
        this.removeAllRender();
        let render = cc.instantiate(this.render);
        if (render) {
            this.renderWidth = render.width;
            this.renderHeight = render.height;
            render.destroy();
        } else {
            console.error(" ***** render is null, please set in component panel or use setRender function ***** ");
        }

        let horizontal = this.scrollView.horizontal;
        // this.visibleRenderCount = horizontal ? Math.ceil((this.content.parent.width - this.paddingLeft - this.paddingRight) / (this.renderWidth + this.gap.x)) : Math.ceil((this.content.parent.height - this.paddingTop - this.paddingBottom) / (this.renderHeight + this.gap.y));
        this.visibleRenderCount = horizontal ? Math.ceil((this.content.parent.width - this.padding.z - this.padding.w) / (this.renderWidth + this.gap.x)) : Math.ceil((this.content.parent.height - this.padding.x - this.padding.y) / (this.renderHeight + this.gap.y));
    }


    public setRenderScript(script: unknown): void;
    public setRenderScript(script: string): void;
    /**
     * 设置渲染类控制脚本
     * @param script - 
     */
    public setRenderScript(script: unknown) {
        this.renderScript = script;
    }


    /**
     * 更新scrollView的content内容
     * @param range - 更新的范围[start, end]
     */
    protected updateContent(range: number[]) {
        this.calculateContentSize();
        for (let i = range[0]; i <= range[1]; i++) {
            let render = this.renderIndexDictionary[i] || this.renderPool.get();
            if (!render) {
                render = cc.instantiate(this.render);
                render.anchorX = 0;
                render.anchorY = 1;
                if (this.renderScript != null) Utils.addNodeScript(render, this.renderScript);
                else Utils.addNodeScript(render, this.render.name);
            }
            render.removeFromParent(false);
            this.addRender(render, i);
            this.updateRender(render, this._data[i]);
            this.renderIndexDictionary[i] = render;
        }
    }


    /**
     * 调用条目控制脚本的更新方法
     * @param render - 要更新的节点
     * @param data - 数据
     */
    protected updateRender(render: cc.Node, data: any) {
        let scriptName = this.render.name;
        let script = render.getComponent(scriptName) as ScrollViewRender;
        if (script != null) {
            script.dto = data;
            script.updateContent();
        }
    }


    /* 计算content大小，并修改 */
    protected calculateContentSize() {
        let horizontal = this.scrollView.horizontal;
        if (horizontal)
            // this.content.width = Math.ceil(this._data.length / this.multiple) * (this.renderWidth + this.gap.x) - this.gap.x + this.paddingLeft + this.paddingRight;
            this.content.width = Math.ceil(this._data.length / this.multiple) * (this.renderWidth + this.gap.x) - this.gap.x + this.padding.z + this.padding.w;
        else
            // this.content.height = Math.ceil(this._data.length / this.multiple) * (this.renderHeight + this.gap.y) - this.gap.y + this.paddingTop + this.paddingBottom;
            this.content.height = Math.ceil(this._data.length / this.multiple) * (this.renderHeight + this.gap.y) - this.gap.y + this.padding.x + this.padding.y;
    }


    /**
     * 添加渲染节点
     * @param render - 添加的节点
     * @param index - 添加的位置索引
     */
    protected addRender(render: cc.Node, index?: number) {
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
        // let x = (render.width * (render.anchorX + col)) * duration.x + this.paddingLeft + gap * col - this.content.width * this.content.anchorX + render.anchorX * render.width - this.content.width * this.content.anchorX;
        let x = (render.width * (render.anchorX + col)) * duration.x + this.padding.z + gap * col - this.content.width * this.content.anchorX + render.anchorX * render.width - this.content.width * this.content.anchorX;
        // let y = (render.height * (1 - render.anchorY + row)) * duration.y + this.paddingTop + gap * row - this.content.height * (1 - this.content.anchorY);
        let y = (render.height * (1 - render.anchorY + row)) * duration.y + this.padding.x + gap * row - this.content.height * (1 - this.content.anchorY);
        y *= -1;
        render.setPosition(x, y);
    }


    /* 移除并销毁scrollView的content中的所有节点 */
    protected removeAllRender() {
        for (let i = 0; i < this.content.children.length; i++) {
            let c = this.content.children[i];
            this.content.removeChild(c);
            c.destroy();
        }
    }


    /* 回收scrollView的content中的所有节点 */
    protected recycleAllRender() {
        for (let i = this.content.children.length - 1; i >= 0; i--) {
            let c = this.content.children[i];
            c.removeFromParent(false)
            this.renderPool.put(c);
        }
        this.renderIndexDictionary = {};
    }


    /**
     * 获取scrollView显示的始末索引范围
     * @returns [start, end] 显示的始末索引
     */
    protected getVisibleRange() {
        if (!this._data)
            return [0, 0];

        let scrollOffset = this.scrollView.getScrollOffset();
        let start = 0;
        let horizontal = this.scrollView.horizontal;
        start = horizontal ? Math.floor(-scrollOffset.x / (this.renderWidth + this.gap.x)) - 1 : Math.floor(scrollOffset.y / (this.renderHeight + this.gap.y)) - 1;
        start = start < 0 ? 0 : start;
        let end = this.multiple * (start + this.visibleRenderCount + this.spawnCount);
        end = end > this._data.length ? this._data.length - 1 : end;
        return [start, end];
    }


    /**
     * 回收一个范围中的所有节点
     * @param range - [start, end] 需要回收的索引范围
     */
    protected recycleRendersByRange(range: number[]) {
        if (!range || range.length < 2)
            return;
        for (let i = this.visibleIndexRange[0]; i < range[0]; i++) {
            if (i < 0 || !this.renderIndexDictionary[i])
                continue;
            this.renderPool.put(this.renderIndexDictionary[i]);
            this.renderIndexDictionary[i] = null;
        }
        for (let i = this.visibleIndexRange[1]; i > range[1]; i--) {
            if (i < 0 || !this.renderIndexDictionary[i])
                continue;
            this.renderPool.put(this.renderIndexDictionary[i]);
            this.renderIndexDictionary[i] = null;
        }
        this.visibleIndexRange[0] = range[0];
        this.visibleIndexRange[1] = range[1];
    }


    protected checkNeedUpdate(range: number[]) {
        return range && this.visibleIndexRange && (this.visibleIndexRange[0] != range[0] || this.visibleIndexRange[1] != range[1]);
    }


    // class end
}
