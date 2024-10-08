import Utils from "../utils/Utils";


export enum LayerType {
    none,
    main_view,
    main_window,
    count,
}


export default class LayerManager {


    private static inited: boolean = false;
    private static layers: { [key: number]: cc.Node };
    public static root: cc.Node;
    /** 游戏主界面 */
    public static main_view: cc.Node;
    /** 游戏弹窗界面 */
    public static main_window: cc.Node;


    /**
     * 初始化界面管理器
     * @param root - cocos画布容器
     */
    public static init(root: cc.Node) {
        if (this.inited) return;
        this.inited = true;

        this.root = root;
        this.layers = {};

        this.main_view = Utils.FindChildByName(this.root, "main_view");
        if (!this.main_view) {
            this.main_view = this.createLayer("main_view", LayerType.main_view);
        }

        this.main_window = Utils.FindChildByName(this.root, "main_window");
        if (!this.main_window) {
            this.main_window = this.createLayer("main_window", LayerType.main_window);
        }
    }


    private static createLayer(containerName: string, containerType: LayerType, parent?: cc.Node) {
        let node = new cc.Node();
        node.name = containerName;
        if (!parent) parent = this.root;
        node.width = parent.width;
        node.height = parent.height;
        let widget = node.addComponent(cc.Widget);
        widget.left = 0;
        widget.right = 0;
        widget.top = 0;
        widget.bottom = 0;
        widget.target = parent;
        parent.addChild(node);
        widget.updateAlignment();
        this.layers[containerType] = node;
        return node;
    }


    public static getLayer(containerType: LayerType): cc.Node {
        if (!this.inited) {
            throw new Error("LayerManager not inited");
        }
        return this.layers[containerType];
    }


    // class end
}
window["layerManager"] = LayerManager;
