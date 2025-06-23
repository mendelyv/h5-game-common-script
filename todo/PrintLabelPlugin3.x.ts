export type HtmlCharText = { text: string, color: string };
/**
 * @class: PrintLabelPlugin
 * @description: 打字机插件
 * @author: Ran
 * @time: 2024-09-05 14:21:13
 */
export class PrintLabelPlugin {


    /** 步进时间ms */
    public stepTime: number = 100;


    protected _label: Laya.Label;
    protected _labelString: string;
    protected _labelIndex: number = 0;

    protected _HTML: Laya.Text;


    /** 当前替换children下标 */
    protected _childrenIndex: number = 0;
    /** 当前字符替换的下标 */
    protected _wordIndex: number = 0;
    protected _children: HtmlCharText[][];
    protected _finishHandler: Laya.Handler;
    protected _wordString: string;
    protected _printing: boolean = false;
    public get printing(): boolean { return this._printing; }


    public setLabel(lb: Laya.Label): void {
        this._label = lb;
        this._labelString = this._label.text;
        this._label.text = "";
    }


    public setHTML(html: Laya.Text): void {
        this._HTML = html;
        this.clean();
    }


    public setFinishHandler(handler: Laya.Handler): void {
        this._finishHandler = handler;
    }


    public print(): void {
        if (!this._checkValid()) return;
        this.clean();
        this._labelIndex = 0;
        this._childrenIndex = 0;
        Laya.timer.loop(this.stepTime, this, this._onClock);
        this._printing = true;
    }


    public quickPrint(): void {
        if (!this._printing) {
            this._labelIndex = 0;
            this._childrenIndex = 0;
        }
        if (this._HTML != null)
            this._printHTMLImmediately();
        if (this._label != null)
            this._printLabelImmediately();
    }


    public clean(): void {
        if (!this._checkValid()) return;
        if (this._HTML != null) {
            this._childrenIndex = 0;
            this._wordIndex = 0;
            this._wordString = "";
            // @ts-ignore
            let elements = this._HTML._elements;
            this._children = [];
            if (elements != null && elements.length > 0) {
                for (let i = 0; i < elements.length; i++) {
                    let textList: HtmlCharText[] = [];
                    let c = elements[i];
                    if (c.text != null) {
                        let words = c.text;
                        for (let j = 0; j < words.length; j++) {
                            textList.push({color:c.style.color,text:words[j]})
                        }
                        this._children.push(textList);
                    }
                }
            }
            this._HTML.text = "";
        }


        if (this._label != null) {
            this._label.text = "";
        }
    }


    public step(): void {
        if (this._HTML != null) {
            while (this._checkChildrenIndexNeedStep()) {
                this._childrenIndex++;
                this._wordIndex = 0;
            };
            if (this._checkHTMLFinish()) {
                this._onComplete();
                return;
            }
            if (this._childrenIndex >= this._children.length) return;
            let childs: HtmlCharText[] = this._children[this._childrenIndex];
            let textElement = childs[this._wordIndex];
            this._wordString += `<font color='${textElement.color}'>${textElement.text}</font>`;
            this._HTML.text = this._wordString;
            // words[this._wordIndex].char = text[this._wordIndex];
            this._wordIndex++;
        }

        if (this._label != null) {
            if (this._checkLabelFinish()) {
                this._onComplete();
                return;
            }
            let char = this._labelString[this._labelIndex];
            if (char == "\\") {
                this._labelIndex++;
                char += this._labelString[this._labelIndex];
            }
            this._label.text += char;
            this._labelIndex++;
        }
    }


    private _printHTMLImmediately(): void {
        for (; this._childrenIndex < this._children.length;) {
            if (this._checkHTMLFinish()) {
                break;
            }
            if (this._checkChildrenIndexNeedStep()) {
                this._childrenIndex++;
                this._wordIndex = 0;
                continue;
            }
            let childs: HtmlCharText[] = this._children[this._childrenIndex];
            let textElement = childs[this._wordIndex];
            this._wordString += `<font color='${textElement.color}'>${textElement.text}</font>`;
            this._HTML.text = this._wordString;
            this._wordIndex++;
        }
        this._onComplete();
    }


    private _printLabelImmediately(): void {
        this._onComplete();
        this._label.text = this._labelString;
        this._labelIndex = this._labelString.length;
    }


    private _onClock(): void {
        this.step();
    }


    private _checkChildrenIndexNeedStep(): boolean {
        let childs: HtmlCharText[] = this._children[this._childrenIndex];
        if (childs == null) return false;
        let word = childs[this._wordIndex];
        return word == null;
    }


    private _checkHTMLFinish(): boolean {
        let child: HtmlCharText[] = this._children[this._childrenIndex];
        return child == null;
    }


    private _checkLabelFinish(): boolean {
        return this._labelIndex >= this._labelString.length;
    }


    private _checkValid(): boolean {
        return this._label != null || this._HTML != null;
    }


    private _onComplete(): void {
        Laya.timer.clearAll(this);
        this._printing = false;
        if (this._finishHandler != null)
            this._finishHandler.run();
    }


    public destroy(): void {
        this._onComplete();
        this._label = null;
        this._HTML = null;
        this._children = [];
    }


    // class end
}
