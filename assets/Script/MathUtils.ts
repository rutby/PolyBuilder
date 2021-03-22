
/**
 * 数学工具类
 */

var findClosestIntersectBorder = function(points, pointIndex) {
    var target = {min: null, border: []};
    for (var i = 0; i < points.length; i++) {
        var currIndex = i;
        var prevIndex = (i - 1 + points.length) % points.length;
        if (currIndex != pointIndex && prevIndex != pointIndex) {
            var a = points[pointIndex - 1];
            var b = points[pointIndex];
            var c = points[prevIndex];
            var d = points[currIndex];
            var retP = cc.p(0, 0);
            if (cc.pLineIntersect(a, b, c, d, retP) && (retP.y >= 0.0 && retP.y <= 1.0 && retP.x > 0)) {
                if (target.min == null || target.min > retP.x) {
                    target.min = retP.x;
                    var P = cc.p(0, 0);
                    P.x = a.x + retP.x * (b.x - a.x);
                    P.y = a.y + retP.x * (b.y - a.y);
                    target.border = [prevIndex, P, pointIndex];
                }
            }
        }
    }
    return target.border;
}

var splitPoly = function(points: cc.Vec2[]) {
    var contains = [];
    for (var i = 0; i < points.length; i++) {
        var currIndex = i;
        var prevIndex = (i - 1 + points.length) % points.length;
        var nextIndex = (i + 1) % points.length;
        var side1 = cc.pSub(points[currIndex], points[prevIndex]);
        var side2 = cc.pSub(points[nextIndex], points[currIndex]);
        var area = side1.x * side2.y - side1.y * side2.x;
        if (area < 0) {
            // 返回线段起点索引
            var border = findClosestIntersectBorder(points, currIndex);
            contains.push(border);

            if (border[0] < i) {
                contains = contains.filter(ele => {
                    return typeof ele == 'number'? ele > border[0]: true;
                })
                break;
            }
            i = border[0];
        } else {
            contains.push(currIndex);
        }
    }

    return contains;
}

var parsePoints = function(points, arr) {
    var ret = [];
    arr.forEach(element => {
        if (typeof element == 'number') {
            ret.push(points[element]);
        } else {
            ret.push(element[1]);
        }
    });
    return ret;
}

export default class MathUtils{
    /**
     * 任意多边形坐标点转换为凸多边形列表
     * @param rawPoints 任意多边形点集
     * @returns 凸多边形列表
     */
    static points2convex(rawPoints) {
        var convexPolys = [];
        var stack = [rawPoints];
        do{
            var stepPoints = stack.splice(0, 1)[0];
            var posIndexArr = splitPoly(stepPoints);
            var fixPoints = parsePoints(stepPoints, posIndexArr);
            convexPolys.push(fixPoints);
            
            posIndexArr.forEach(element => {
                if (typeof element == 'object') {
                    var subPoints = [];
                    for (var posIndex = element[2]; posIndex != element[0];) {
                        subPoints.push(stepPoints[posIndex]);
                        posIndex = (posIndex + 1) % stepPoints.length;
                    }
                    subPoints.push(stepPoints[element[0]]);
                    subPoints.push(element[1]);
                    stack.push(subPoints);
                }
            });
        }while(stack.length > 0);
        return convexPolys;
    }

    /**
     * 任意多边形坐标点转换为三角形列表
     * @param rawPoints 任意多边形点集
     * @returns 三角形列表
     */
    static points2tris(rawPoints) {
        var points = this.points2convex(rawPoints);
        var tris = [];
        points.forEach(element => {
            tris = tris.concat(MathUtils.convec2tris(element));
        });
        return tris;
    }

    /**
     * 凸多边形转三角形列表
     * @param rawPoints 凸多边形点集
     * @returns 三角形列表
     */
    static convec2tris(rawPoints) {
        var tris = [];
        for (var i = 1; i < rawPoints.length - 1; i++) {
            var pointCurr = rawPoints[i];
            var pointNext = rawPoints[i+1];
            tris.push(MathUtils.tris2ccw([rawPoints[0], pointCurr, pointNext]));
        }
        return tris;
    }

    /**
     * 三角形点集转换为逆时针排列
     */
    static tris2ccw(points) {
        var a = points[0];
        var b = points[1];
        var c = points[2];
        var ab = cc.pSub(b, a);
        var ac = cc.pSub(c, a);

        return cc.pCross(ab, ac) > 0? points : [a, c, b];
    }

    /**
     * 获得向量逆时针角度
     */
    static vec2degree(vec) {
        var degree = cc.radiansToDegrees(cc.pAngleSigned(vec, cc.v2(1, 0)));
        return degree < 0? -degree : 360 - degree;
    }

    /**
     * 检测矩形是否包含点集中的任意一点
     * 
     */
    static rectContainsPoints(rect: cc.Rect, points: cc.Vec2[]): boolean {
        var matched = false;
        for (var i = 0; i < points.length; i++) {
            if (Boolean(rect.contains(points[i]))) {
                matched = true;
                break;
            }
        }
        return matched;
    }

    /**
     * 判定点是否在三角形集合内
     */
    static trisContainsPoint(tris: cc.Vec2[][], point: cc.Vec2) {
        var contains = false;
        for (var i = 0; i < tris.length; i++) {
            if (MathUtils.triContainsPoint(tris[i], point)) {
                contains = true;
                break;
            }
        }
        return contains;
    }

    /**
     * 判定点是否在三角形内
     */
    static triContainsPoint(tri: cc.Vec2[], point: cc.Vec2) {
        var a = tri[0];
        var b = tri[1];
        var c = tri[2];
        var d = point;
        var ab = cc.pSub(b, a);
        var ac = cc.pSub(c, a);
        var ad = cc.pSub(d, a);
        var bc = cc.pSub(c, b);
        var bd = cc.pSub(d, b);
        var ca = cc.pSub(a, c);
        var cd = cc.pSub(d, c);

        var areaABC = cc.pCross(ab, ac);
        var areaABD = cc.pCross(ab, ad);

        var areaBCD = cc.pCross(bc, bd);
        var areaCAD = cc.pCross(ca, cd);

        var c1 = areaABD < 0 || areaABD > areaABC;
        var c2 = areaBCD < 0 || areaBCD > areaABC;
        var c3 = areaCAD < 0 || areaCAD > areaABC;
        var outside = c1 || c2 || c3;
        return !outside;
    }
}
