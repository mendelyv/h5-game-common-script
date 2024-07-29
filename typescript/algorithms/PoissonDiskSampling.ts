export default class PoissonDiskSampling {
    public generatePoints(width: number, height: number, minDistance: number, maxPoints: number): Array<{ x: number, y: number }> {
        const gridSize = minDistance / Math.sqrt(2);
        const gridWidth = Math.ceil(width / gridSize);
        const gridHeight = Math.ceil(height / gridSize);

        const grid = Array(gridWidth * gridHeight).fill(null);
        const points: Array<{ x: number, y: number }> = [];
        const processList = [];

        function addPoint(x: number, y: number) {
            const gridX = Math.floor(x / gridSize);
            const gridY = Math.floor(y / gridSize);
            if (grid[gridX + gridY * gridWidth] === null) {
                grid[gridX + gridY * gridWidth] = points.length;
                points.push({ x, y });
                processList.push({ x, y });
            }
        }

        function inBounds(x: number, y: number) {
            return x >= 0 && x < width && y >= 0 && y < height;
        }

        function distance(p1: { x: number, y: number }, p2: { x: number, y: number }) {
            return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
        }

        function isFarEnough(x: number, y: number) {
            const gridX = Math.floor(x / gridSize);
            const gridY = Math.floor(y / gridSize);

            for (let i = -2; i <= 2; i++) {
                for (let j = -2; j <= 2; j++) {
                    const nx = gridX + i;
                    const ny = gridY + j;
                    if (nx >= 0 && ny >= 0 && nx < gridWidth && ny < gridHeight) {
                        const index = grid[nx + ny * gridWidth];
                        if (index !== null) {
                            const point = points[index];
                            if (distance(point, { x, y }) < minDistance) {
                                return false;
                            }
                        }
                    }
                }
            }
            return true;
        }

        addPoint(width * Math.random(), height * Math.random());

        while (processList.length > 0 && points.length < maxPoints) {
            const point = processList[Math.floor(Math.random() * processList.length)];
            let found = false;

            for (let i = 0; i < 30; i++) {
                const radius = minDistance * (1 + Math.random());
                const angle = Math.random() * 2 * Math.PI;
                const newX = point.x + radius * Math.cos(angle);
                const newY = point.y + radius * Math.sin(angle);

                if (inBounds(newX, newY) && isFarEnough(newX, newY)) {
                    addPoint(newX, newY);
                    found = true;
                    break;
                }
            }

            if (!found) {
                processList.splice(processList.indexOf(point), 1);
            }
        }

        return points;
    }
}
