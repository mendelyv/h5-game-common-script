import ViewRegisterDto from "./ViewRegisterDto";
import ViewTreeNode from "./ViewTreeNode";

/**
 * @class: ViewTree
 * @description: 视图树
 * @author: Ran
 * @time: 2024-08-13 14:09:24
 */
export default class ViewTree {


    private root: ViewTreeNode;
    /** 界面id字典，方便索引 */
    private dictionary: { [key: number | string]: ViewTreeNode };
    private parentWaitQueue: { [key: number | string]: ViewTreeNode[] };
    public generate(views: ViewRegisterDto[]): void {
        this.root = new ViewTreeNode();
        this.dictionary = {};
        this.parentWaitQueue = {};
        for (let i = 0; i < views.length; i++) {
            let view = views[i];
            this.addNodeByDto(view);
        }
    }


    public addDictionary(id: number | string, node: ViewTreeNode) {
        this.dictionary[id] = node;
        if (this.parentWaitQueue[id] != null) {
            let parent = this.dictionary[id];
            let children = this.parentWaitQueue[id];
            for (let i = 0; i < children.length; i++) {
                let child = children[i];
                parent.addChild(child);
            }
            delete this.parentWaitQueue[id];
        }
    }


    public addNodeByDto(dto: ViewRegisterDto): ViewTreeNode {
        if (this.root == null) return;
        let node = new ViewTreeNode();
        node.data = dto;
        if (dto.parent == null) {
            node.parent = this.root;
            this.root.addChild(node);
        } else {
            let parent = this.getNode(dto.parent);
            if (parent == null) {
                if (this.parentWaitQueue[dto.parent] == null)
                    this.parentWaitQueue[dto.parent] = [];
                this.parentWaitQueue[dto.parent].push(node);
            } else {
                parent.addChild(node);
            }
        }
        this.addDictionary(dto.id, node);
    }


    public getNode(dto: ViewRegisterDto): ViewTreeNode;
    public getNode(id: number | string): ViewTreeNode;
    public getNode(dto: unknown): ViewTreeNode {
        if (typeof dto == 'number' || typeof dto == 'string')
            return this.dictionary[dto];
        else if (typeof dto == "object")
            return this.dictionary[(dto as ViewRegisterDto).id];
    }


    public destroy(): void {
        this.root.destroy();
    }


}
