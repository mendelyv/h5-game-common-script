import { getViewRegisterDto } from "./ViewConst";
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


    protected addDictionary(id: number | string, node: ViewTreeNode) {
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
            let parentRegisterDto = getViewRegisterDto(dto.parent);
            let parent = this.dictionary[parentRegisterDto.id];
            if (parent == null) {
                if (this.parentWaitQueue[parentRegisterDto.id] == null)
                    this.parentWaitQueue[parentRegisterDto.id] = [];
                this.parentWaitQueue[parentRegisterDto.id].push(node);
            } else {
                parent.addChild(node);
            }
        }
        this.addDictionary(dto.id, node);
    }


    public getNode(dto: ViewRegisterDto): ViewTreeNode;
    public getNode(id: number | string): ViewTreeNode;
    public getNode(value: unknown): ViewTreeNode {
        if (typeof value == 'number' || typeof value == 'string')
            return this.dictionary[value];
        else if (typeof value == "object")
            return this.dictionary[(value as ViewRegisterDto).id];
    }


    public destroy(): void {
        this.root.destroy();
    }


}
