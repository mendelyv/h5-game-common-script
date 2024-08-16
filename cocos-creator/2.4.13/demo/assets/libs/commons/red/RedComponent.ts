import { redManager } from "./RedManager";

export default abstract class RedComponent extends cc.Component {


    protected redDisplays: { [type: number]: cc.Node[] } = {};


    protected registerRedDisplay(type: number, node: cc.Node): void;
    protected registerRedDisplay(type: number, node: cc.Node): void;
    protected registerRedDisplay(type: number, node: cc.Node | cc.Node[]): void {
        if (this.redDisplays[type] == null) this.redDisplays[type] = [];
        if (Array.isArray(node)) this.redDisplays[type].push(...node);
        else this.redDisplays[type].push(node);
    }


    public updateRedDisplays(type: number): void {
        let nodes = this.redDisplays[type];
        let value = redManager.check(type);
        if (nodes != null && nodes.length > 0) {
            for (let i = 0; i < nodes.length; i++) {
                let node = nodes[i];
                node.active = value;
            }
        }
    }


    // class end
}
