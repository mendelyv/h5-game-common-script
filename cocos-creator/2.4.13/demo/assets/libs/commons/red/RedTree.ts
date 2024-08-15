import RedTreeNode from "./RedTreeNode";
import RedRegisterDto from "./RedRegisterDto";
import { RedType } from "./RedType";

export default class RedTree {


    protected root: RedTreeNode;
    private dictionary: { [type: number]: RedTreeNode };
    private parentWatiQueue: { [type: number]: RedTreeNode[] };


    public generate(reds: RedRegisterDto[]): void {
        this.root = new RedTreeNode();
        this.dictionary = {};
        this.parentWatiQueue = {};
        for (let i = 0; i < reds.length; i++) {
            let red = reds[i];
            this.addNodeByDto(red);
        }
    }


    protected addDictionary(type: RedType, node: RedTreeNode) {
        this.dictionary[type] = node;
        if (this.parentWatiQueue[type] != null) {
            let parent = this.dictionary[type];
            let children = this.parentWatiQueue[type];
            for (let i = 0; i < children.length; i++) {
                let child = children[i];
                parent.addChild(child);
            }
            delete this.parentWatiQueue[type];
        }
    }


    public addNodeByDto(dto: RedRegisterDto): RedTreeNode {
        if (this.root == null) return;
        let node = new RedTreeNode();
        node.data = dto;
        if (dto.parent == null) {
            node.parent = this.root;
            this.root.addChild(node);
        } else {
            let parent = this.dictionary[dto.parent];
            if (parent == null) {
                if (this.parentWatiQueue[dto.parent] == null)
                    this.parentWatiQueue[dto.parent] = [];
                this.parentWatiQueue[dto.parent].push(node);
            } else {
                parent.addChild(node);
            }
        }
        this.addDictionary(dto.type, node);
    }


    public getNode(type: RedType): RedTreeNode {
        return this.dictionary[type];
    }


    public destroy(): void {
        if (this.root != null) this.root.destroy();
        this.root = null;
    }


    // class end
}
