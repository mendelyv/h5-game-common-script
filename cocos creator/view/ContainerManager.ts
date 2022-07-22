import Utils from "./Utils";

export default class ContainerManager {
    public static inited: boolean = false;
    private static layers: { [key: number]: cc.Node };
    /** 游戏主界面 */
    public static main_view: cc.Node;
    /** 游戏弹窗界面 */
    public static main_window: cc.Node;

    /**
     * 初始化界面管理器
     * @param canvas - cocos画布容器
     */
    public static init(canvas: cc.Node) {
        if (this.inited) return;
        this.inited = true;

        this.layers = {};

        this.main_view = Utils.FindChildByName(canvas, "main_view");
        if (!this.main_view) {
            this.main_view = new cc.Node();
            this.main_view.name = "main_view";
            canvas.addChild(this.main_view);
            let viewLayout = this.main_view.addComponent(cc.Layout);
            viewLayout.paddingTop = viewLayout.paddingRight = viewLayout.paddingBottom = viewLayout.paddingLeft = 0;
        }
        this.layers[ContainerType.main_view] = this.main_view;

        this.main_window = Utils.FindChildByName(canvas, "main_window");
        if (!this.main_window) {
            this.main_window = new cc.Node();
            this.main_window.name = "main_window";
            canvas.addChild(this.main_window);
            let windowLayout = this.main_window.addComponent(cc.Layout);
            windowLayout.paddingTop = windowLayout.paddingRight = windowLayout.paddingBottom = windowLayout.paddingLeft = 0;
        }
        this.layers[ContainerType.main_window] = this.main_window;
    }


    public static getContainer(containerType: ContainerType): cc.Node {
        return this.layers[containerType];
    }
}
window["ContainerManager"] = ContainerManager;


export enum ContainerType {
    none,
    main_view,
    main_window,
    count,
}
