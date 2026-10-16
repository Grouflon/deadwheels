export const R2D = 180.0 / Math.PI;
export const D2R = Math.PI / 180.0;

export class Vector2
{
    x: number = 0;
    y: number = 0;

    constructor(x: number = 0, y: number = 0)
    {
        this.x = x;
        this.y = y;
    }

    copy() : Vector2
    {
        return new Vector2(this.x, this.y);
    }

    dot(v: Vector2) : number
    {
        return Vector2.Dot(this, v);
    }

    add(v: Vector2) : Vector2
    {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    subtract(v: Vector2) : Vector2
    {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    multiply(f: number) : Vector2
    {
        return new Vector2(this.x * f, this.y * f);
    }

    divide(f: number) : Vector2
    {
        return new Vector2(this.x / f, this.y / f);
    }

    rotate(angleDegrees: number) : Vector2
    {
        return Vector2.Rotate(this, angleDegrees);
    }

    lengthSquared() : number
    {
        return this.x*this.x + this.y*this.y;
    }

    length() : number
    {
        return Math.sqrt(this.lengthSquared());
    }

    normalize() : Vector2
    {
        let l = this.length();
        if (l == 0) return new Vector2(0,0);
        return this.divide(l);
    }

    static Dot(a: Vector2, b: Vector2) : number
    {
        return a.x*b.x + a.y*b.y;
    }

    static Add(a: Vector2, b: Vector2) : Vector2
    {
        return new Vector2(a.x + b.x, a.y + b.y);
    }

    static Subtract(a: Vector2, b: Vector2) : Vector2
    {
        return new Vector2(a.x - b.x, a.y - b.y);
    }

    static Multiply(a: Vector2, b: number) : Vector2
    {
        return new Vector2(a.x * b, a.y * b);
    }

    static Rotate(v: Vector2, angle_degrees: number) : Vector2
    {
        let a = angle_degrees * Math.PI / 180;
        return new Vector2(
            v.x * Math.cos(a) - v.y * Math.sin(a),
            v.x * Math.sin(a) + v.y * Math.cos(a)
        );
    }

    static SignedAngleBetween(a: Vector2, b: Vector2) : number
    {
        return Math.atan2(a.x*b.y - a.y*b.x, a.x*b.x + a.y*b.y) * R2D;
    }
}

export class Plane2D
{
    normal: Vector2;
    distance: number;

    constructor(normal: Vector2, distance: number)
    {
        this.normal = normal;
        this.distance = distance;
    }

    static FromOriginNormal(origin: Vector2, normal: Vector2) : Plane2D
    {
        let n = normal.normalize();
        return new Plane2D(n, n.dot(origin));
    }
}

export class Vector3
{
    x: number = 0;
    y: number = 0;
    z: number = 0;

    constructor(x: number = 0, y: number = 0, z: number = 0)
    {
        this.x = x;
        this.y = y;
        this.z = y;
    }
}

export function BarycentricCoordinates(p: Vector2, p0: Vector2, p1: Vector2, p2: Vector2) : Vector3
{
    var v0 = Vector2.Subtract(p1, p0);
    var v1 = Vector2.Subtract(p2, p0);
    var v2 = Vector2.Subtract(p, p0);

    var d00 = Vector2.Dot(v0, v0);
    var d01 = Vector2.Dot(v0, v1);
    var d11 = Vector2.Dot(v1, v1);
    var d20 = Vector2.Dot(v2, v0);
    var d21 = Vector2.Dot(v2, v1);

    var denom = d00*d11 - d01*d01;

    var result = new Vector3();
    result.y = (d11*d20 - d01*d21)/denom;
    result.z = (d00*d21 - d01*d20)/denom;
    result.x = 1 - (result.z + result.y);
    return result;
}

export class LineLineIntersectionResult
{
    result: boolean;
    intersection: Vector2;
    aRatio: number;
    bRatio: number;

    constructor(result: boolean, intersection: Vector2 = new Vector2, aRatio: number = 0, bRatio: number = 0)
    {
        this.result = result;
        this.intersection = intersection;
        this.aRatio = aRatio;
        this.bRatio = bRatio;
    }
}

export function LineLineIntersection(a0: Vector2, a1: Vector2, b0: Vector2, b1: Vector2) : LineLineIntersectionResult
{
    const a = a1.subtract(a0);
    const b = b1.subtract(b0);
    const denom = b.y * a.x - b.x * a.y;
    if (denom === 0) return new LineLineIntersectionResult(false); // Parallel or collinear

    const t = (b.x * (a0.y - b0.y) - b.y * (a0.x - b0.x)) / denom;
    const u = (a.x * (a0.y - b0.y) - a.y * (a0.x - b0.x)) / denom;

    return new LineLineIntersectionResult(
        true,
        a0.add(a.multiply(t)),
        t,
        u
    );
}

export function SegmentSegmentIntersection(a0: Vector2, a1: Vector2, b0: Vector2, b1: Vector2) : LineLineIntersectionResult
{
    let result = LineLineIntersection(a0, a1, b0, b1);
    if (!result) return result;
    if (result.aRatio < 0 || result.aRatio > 1 || result.bRatio < 0 || result.bRatio > 1) return new LineLineIntersectionResult(false);
    return result;
}

export function PositiveMod(v: number, divisor: number) : number
{
    return ((v % divisor) + divisor) % divisor;
}
