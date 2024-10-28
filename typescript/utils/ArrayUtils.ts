/**
 * @class: ArrayUtils
 * @description: 数组工具类
 * @author: Ran
 * @time: 2024-05-31 14:22:10
 */
export default class ArrayUtils {


    /**
     * 获取二维数组连续数据的矩形边界点
     * @param matrix - 
     * @param value - 
     * @returns [[左上角行,左上角列],[右下角行,右下角列]]
     */
    public static findRectBoundaries(matrix: Array<Array<number>>, value: number): Array<Array<number>> {
        let directions = [[-1, 0], [1, 0], [0, -1], [0, 1],];
        let boundaries: Array<Array<number>> = [];

        function inBounds(row: number, col: number): boolean {
            return row >= 0 && row < matrix.length && col >= 0 && col < matrix[0].length;
        }

        function dfs(x: number, y: number, value: unknown, visited: Array<Array<boolean>>, boundary: Array<number>) {
            visited[x][y] = true;
            // 更新边界
            boundary[0] = Math.min(boundary[0], x);
            boundary[1] = Math.min(boundary[1], y);
            boundary[2] = Math.max(boundary[2], x);
            boundary[3] = Math.max(boundary[3], y);
            // 遍历所有相邻的方向
            for (const [dx, dy] of directions) {
                const newX = x + dx;
                const newY = y + dy;
                if (inBounds(newX, newY) && matrix[newX][newY] == value && !visited[newX][newY]) {
                    dfs(newX, newY, value, visited, boundary);
                }
            }
        }

        let visited: Array<Array<boolean>> = Array.from({ length: matrix.length }, () => Array(matrix[0].length).fill(false));
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] == value && !visited[i][j]) {
                    let boundary = [i, j, i, j];
                    dfs(i, j, value, visited, boundary);
                    boundaries.push(boundary);
                }
            }
        }

        return boundaries;
    }


    /**
     * 获取二维数组连续数据的边界点
     * @param matrix - 
     * @param value - 
     * @returns 
     */
    public static findBoundaries(matrix: Array<Array<number>>, value: number): Array<Array<number>> {
        let directions = [[-1, 0], [1, 0], [0, -1], [0, 1],];
        const rows = matrix.length;
        const cols = matrix[0].length;
        const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
        const boundaries: Array<Array<number>> = [];

        function isBoundary(x: number, y: number): boolean {
            // 如果相邻点不是目标值或者越界，当前点是边界
            for (const [dx, dy] of directions) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx < 0 || nx >= rows || ny < 0 || ny >= cols || matrix[nx][ny] !== value) {
                    return true;
                }
            }
            return false;
        }

        function dfs(x: number, y: number) {
            visited[x][y] = true;
            let boundary = [x, y];
            if (isBoundary(x, y)) {
                boundaries.push(boundary);
            }

            for (const [dx, dy] of directions) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < rows && ny >= 0 && ny < cols && !visited[nx][ny] && matrix[nx][ny] === value) {
                    dfs(nx, ny);
                }
            }
        }

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (matrix[i][j] === value && !visited[i][j]) {
                    dfs(i, j);
                }
            }
        }

        return boundaries;
    }


    /**
     * 打乱数组，返回一个打乱后的新数组
     * @param arr - 
     * @returns 
     */
    public static shuffleArray(arr: unknown[]): unknown[] {
        let res = [...arr];
        for (let i = res.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [res[i], res[j]] = [res[j], res[i]];
        }
        return res;
    }


    /**
     * 从数组中随机取元素，返回一个新数组
     * @param arr - 
     * @param count - 
     * @returns 
     */
    public static getRandomArray(arr: unknown[], count: number): unknown[] {
        const result = this.shuffleArray(arr);
        return result.slice(0, count);
    }


    // class end
}
