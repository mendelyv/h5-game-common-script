class Utils {
    /**
     * 创建一个渐变graphics，PS：这个方法只做了纵向的，横向的再说
     * @param x - 渐变rect的起点x坐标
     * @param y - 渐变rect的起点y坐标
     * @param top - 上层渐变部分的比例
     * @param bottom - 下层渐变部分的比例
     * @param width - 渐变rect的宽度
     * @param height - 渐变rect的高度
     * @returns 
     */
    public static createFade(x: number, y: number, top: number, bottom: number, width: number, height: number): egret.Shape {
        let shape = new egret.Shape();
        shape.width = width;
        shape.height = height;
        let topRatio = top / height * 255;
        let bottomRatio = (height - bottom) / height * 255;
        let matrix = shape.matrix;
        matrix.createGradientBox(width, height, Math.PI / 2, x, y);
        let colors = [0x000000, 0xffffff, 0xffffff, 0x000000];
        let alphas = [0, 1, 1, 0];
        let ratios = [0, topRatio, bottomRatio, 255];
        shape.graphics.beginGradientFill(egret.GradientType.LINEAR, colors, alphas, ratios, matrix);
        shape.graphics.drawRect(x, y, width, height);
        return shape;
    }

    /**
     * 滚动在Scroller容器下的内容
     * @param container ：容器
     * @param index ：需要滚动的下标
     */
    public static scroll(container: eui.Group, index: number = 0) {
        if (!container) return;
        let scroller = container.parent as eui.Scroller;
        if (!scroller || !egret.is(scroller, "eui.Scroller")) return;
        // if(!container.dataProvider || container.dataProvider.length < 1) return;

        container.validateNow();
        scroller.validateNow();

        let pl = 0, pr = 0, gap = 0, isHor: boolean = true;
        if (container.layout && egret.is(container.layout, "eui.HorizontalLayout")) {
            let layout = container.layout as eui.HorizontalLayout;
            pl = layout.paddingLeft;
            pr = layout.paddingRight;
            gap = layout.gap;
            isHor = true;
        } else if (container.layout && egret.is(container.layout, "eui.VerticalLayout")) {
            let layout = container.layout as eui.VerticalLayout;
            pl = layout.paddingTop;
            pr = layout.paddingBottom;
            gap = layout.gap;
            isHor = false;
        } else {
            if (DEBUG) console.error(" ***** container hasn`t legal layout ***** ")
            return;
        }

        let len = container.numElements   //container.$children.length;
        let item = container.$children[0];
        let itemSize = isHor ? item.width : item.height;
        let maxSize = (itemSize + gap) * len - gap + (pl + pr);

        let pos = (itemSize + gap) * index + pl;
        let scrollerSize = isHor ? (scroller.width > scroller.maxWidth ? scroller.maxWidth : scroller.width) : (scroller.height > scroller.maxHeight ? scroller.maxHeight : scroller.height);
        let maxScroll = maxSize - scrollerSize;

        //如果内容小于显示区域尺寸
        if (maxSize < scrollerSize) {
            isHor ? container.scrollH = 0 : container.scrollV = 0;
            return;
        }

        //如果滚动量小于显示区域
        if (pos + itemSize < scrollerSize) {
            isHor ? container.scrollH = 0 : container.scrollV = 0;
            return;
        }

        isHor ? (container.scrollH = pos > maxScroll ? maxScroll : pos) : (container.scrollV = pos > maxScroll ? maxScroll : pos);
    }
}
