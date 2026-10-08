export class Vector2
{
    x: number = 0;
    y: number = 0;

    constructor(x: number = 0, y: number = 0)
    {
        this.x = x;
        this.y = y;
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

    static Rotate(v: Vector2, angle_degrees: number) : Vector2
    {
        let a = angle_degrees * Math.PI / 180;
        return new Vector2(
            v.x * Math.cos(a) - v.y * Math.sin(a),
            v.x * Math.sin(a) + v.y * Math.cos(a)
        );
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