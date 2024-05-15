module perlin {
    /**
     * @class: Perlin
     * @description: 柏林噪声
     * @author: Ran
     * @time: 2024-05-15 11:12:29
     */
    export class Perlin {


        /** 噪声重复次数 */
        public repeat: number = 0;
        /** 倍频，影响频率frequency = 2 ^ octaves */
        public octaves: number = 1;
        /** 持久度，影响振幅amplitude = persistence ^ octaves */
        public persistence: number = 0;
        /** 辅助排列表 */
        private readonly permutationAuxiliary = [
            151, 160, 137, 91, 90, 15,
            131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
            190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
            88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
            77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
            102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
            135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
            5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
            223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
            129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
            251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
            49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
            138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
        ];
        /** 排列表 */
        private permutation: number[] = [];


        public constructor() {
            this.initPermutation();
        }


        /* 为了避免缓存溢出，我们再重复填充一次数组的值，所以数组最终长度为512 */
        private initPermutation() {
            this.permutation = [];
            for (let i = 0; i < this.permutationAuxiliary.length * 2; i++) {
                this.permutation[i] = this.permutationAuxiliary[i % this.permutationAuxiliary.length];
            }
        }


        private calculate(x: number, y: number, z: number): number {
            if (this.repeat > 0) {
                x = x % this.repeat;
                y = y % this.repeat;
                z = z % this.repeat;
            }

            // 单元正方形
            let xi = Math.floor(x) & 255;
            let yi = Math.floor(y) & 255;
            let zi = Math.floor(z) & 255;

            // 小数部分，代表在单元正方形中的点
            let xf = x - Math.floor(x);
            let yf = y - Math.floor(y);
            let zf = z - Math.floor(z);

            // 非线性差值参数
            let u = this.fade(xf);
            let v = this.fade(yf);
            let w = this.fade(zf);

            // 对8个顶点进行哈希计算
            let p = this.permutation;
            let h000 = p[p[p[xi] + yi] + zi];
            let h010 = p[p[p[xi] + this.increase(yi)] + zi];
            let h001 = p[p[p[xi] + yi] + this.increase(zi)];
            let h011 = p[p[p[xi] + this.increase(yi)] + this.increase(zi)];
            let h100 = p[p[p[this.increase(xi)] + yi] + zi];
            let h110 = p[p[p[this.increase(xi)] + this.increase(yi)] + zi];
            let h101 = p[p[p[this.increase(xi)] + yi] + this.increase(zi)];
            let h111 = p[p[p[this.increase(xi)] + this.increase(yi)] + this.increase(zi)];

            // 梯度向量
            let d000 = this.gradient(h000, xf, yf, zf);
            let d100 = this.gradient(h100, xf - 1, yf, zf);
            let d010 = this.gradient(h010, xf, yf - 1, zf);
            let d110 = this.gradient(h110, xf - 1, yf - 1, zf);
            let d001 = this.gradient(h001, xf, yf, zf - 1);
            let d101 = this.gradient(h101, xf - 1, yf, zf - 1);
            let d011 = this.gradient(h011, xf, yf - 1, zf - 1);
            let d111 = this.gradient(h111, xf - 1, yf - 1, zf - 1);

            // 对8个顶点的影响值做插值
            let x00 = this.lerp(d000, d100, u);
            let x10 = this.lerp(d010, d110, u);
            let xy0 = this.lerp(x00, x10, v);

            let x01 = this.lerp(d001, d101, u);
            let x11 = this.lerp(d011, d111, u);
            let xy1 = this.lerp(x01, x11, v);

            // 求的加权平均值
            let xyz = this.lerp(xy0, xy1, w);

            return (xyz + 1) / 2;
        }


        public noise(x: number, y: number = 0, z: number = 0) {
            let total = 0;
            let frequency = 1;
            let amplitude = 1;
            let totalAmplitude = 0;

            // 利用倍频实现更自然的噪声
            // 频率frequency = 2^octaves
            // 振幅amplitude = persistence ^ octaves
            for (let i = 0; i < this.octaves; i++) {
                total += this.calculate(x * frequency, y * frequency, z * frequency) * amplitude;
                frequency *= 2;
                totalAmplitude += amplitude;
                amplitude *= this.persistence;
            }

            return total / totalAmplitude;
        }


        private fade(t: number): number {
            return t * t * t * (t * (t * 6 - 15) + 10);
        }


        /**
         * 自增1，如果repeat为0则可以直接加1
         * @param num - 
         * @returns 
         */
        private increase(num: number): number {
            num++;
            if (this.repeat > 0) num %= this.repeat;
            return num;
        }


        private lerp(start: number, end: number, t: number): number {
            return start + (end - start) * t;
        }


        /**
         * 梯度函数
         * @param hash - 
         * @param x - 
         * @param y - 
         * @param z - 
         */
        private gradient(hash: number, x: number, y: number, z: number) {
            switch (hash & 0xF) {
                case 0x0: return x + y;
                case 0x1: return -x + y;
                case 0x2: return x - y;
                case 0x3: return -x - y;
                case 0x4: return x + z;
                case 0x5: return -x + z;
                case 0x6: return x - z;
                case 0x7: return -x - z;
                case 0x8: return y + z;
                case 0x9: return -y + z;
                case 0xA: return y - z;
                case 0xB: return -y - z;
                case 0xC: return y + x;
                case 0xD: return -y + z;
                case 0xE: return y - x;
                case 0xF: return -y - z;
                default: return 0;
            }
        }


        // class end
    }


    // module end
}

