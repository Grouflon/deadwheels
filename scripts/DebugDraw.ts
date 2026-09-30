
export function Init(runtime: IRuntime)
{
    singleton = new DebugDraw(runtime);
    if (runtime.layout.getLayer("DEBUG") == null)
    {
        runtime.layout.addLayer("DEBUG", runtime.layout.getLayer("ScreenPostProcess"), "above");
    }
}

export function Tick()
{
    singleton.Tick();
}

export function DrawBox(x: number, y: number, z: number, width: number, height: number, angleDegrees: number, color: Vec3Arr, opacity: number, duration: number)
{
    singleton.DrawBox(x, y, z, width, height, angleDegrees, color, opacity, duration);
}

var singleton: DebugDraw;
class DebugDraw
{
    shapes: Shape[] = [];
    firstUsed: number = -1;
    firstUnused: number = -1;
    runtime: IRuntime;

    constructor(runtime: IRuntime)
    {
        this.runtime = runtime;
    }

    Tick()
    {
        if (this.firstUsed < 0) return;

        let index = this.firstUsed;

        while (index >= 0)
        {
            let s = this.shapes[index];
            let next = s.next;

            s.duration -= this.runtime.dt;
            if (s.duration <= 0)
            {
                this.ReleaseShape(index);
            }

            index = next;
        }
    }

    DrawBox(x: number, y: number, z: number, width: number, height: number, angleDegrees: number, color: Vec3Arr, opacity: number, duration: number)
    {
        let s = this.UseShape();

        s.instance.x = x;
        s.instance.y = y;
        s.instance.z = z;
        s.instance.width = width;
        s.instance.height = height;
        s.instance.angleDegrees = angleDegrees;
        s.instance.colorRgb = [color[0], color[1], color[2]];
        s.instance.opacity = opacity / 100;
        s.duration = duration;
    }

    UseShape() : Shape
    {
        let index = this.firstUnused;
        if (index < 0)
        {
            index = this.shapes.length;

            let instance = this.runtime.objects.Box.createInstance("DEBUG", 0, 0);
            this.shapes.push(new Shape(instance));
            this.firstUnused = index;
        }

        let s = this.shapes[index];

        this.firstUnused = s.next;
        if (this.firstUnused >= 0)
        {
            this.shapes[this.firstUnused].previous = -1;
        }

        s.next = this.firstUsed;
        s.previous = -1;
        if (this.firstUsed >= 0)
        {
            this.shapes[this.firstUsed].previous = index;
        }
        this.firstUsed = index;

        s.instance.isVisible = true;

        return s;
    }

    ReleaseShape(index: number)
    {
        let s = this.shapes[index];
        
        s.instance.isVisible = false;

        // Patch surrouning nodes
        if (s.previous >= 0)
        {
            this.shapes[s.previous].next = s.next;
        }
        if (s.next >= 0)
        {
            this.shapes[s.next].previous = s.previous;
        }

        // Patch first used node
        if (this.firstUsed == index)
        {
            this.firstUsed = s.next;
        }

        // Insert at beginning of unused list
        s.next = this.firstUnused;
        this.firstUnused = index;
        s.previous = -1;
    }
}

class Shape
{
    next: number = -1;
    previous: number = -1;
    instance: IWorldInstance;
    duration: number = 0;

    constructor(instance: IWorldInstance)
    {
        this.instance = instance;
        this.instance.isVisible = false;
    }
}