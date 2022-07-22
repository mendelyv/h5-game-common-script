
/**
 * 生成bezier曲线点
 * @param {x: number, y: number} anchors 贝塞尔曲线控制点，包括起终点
 * @param {number} count 生成点的数量
 * @returns {number[{x: number, y: number}]} 曲线点数组，包括起终点
 */
 function createBezierPoints(anchors, count) {
    let points = [];
    for(let i = 0; i <= count; i++) {
      let p = caculateBezierPoint(anchors, i / count);
      points.push(p);
    }
    return points;
  }
  
  
  /**
   * @param {x: number, y: number} points 贝塞尔曲线控制点，包括起终点
   * @param {number} t 曲线点的比例 [0, 1]
   * @returns {x: number, y: number} 曲线点
   */
  function caculateBezierPoint(points, t) {
    let len = points.length;
    let x = 0, y = 0;
    // 组合
    let combination = function(n, m) {
      let nFactorial = 1, mFactorial = 1;
      while(m > 0) {
        nFactorial *= n;
        mFactorial *= m;
        n--;
        m--;
      }
      return nFactorial / mFactorial;
    };
    for(let i = 0; i < len; i++) {
      let p = points[i];
      x += p.x * combination(len - 1, i) * Math.pow(t, i) * Math.pow(1 - t, len - 1 - i);
      y += p.y * combination(len - 1, i) * Math.pow(t, i) * Math.pow(1 - t, len - 1 - i);
    }
    return {x: x, y: y};
  }
  
  
  function main() {
    let points = [{x: 0, y: 0}, {x: 100, y: 200}, {x: 200, y: 400}];
    let res = createBezierPoints(points, 100);
    for(let i = 0; i < res.length; i++) {
      console.log(`${res[i].x}, ${res[i].y}`);
    }
  }
  
  main();