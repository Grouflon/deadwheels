const DEBUG_LAYER_NAME = "DEBUG";

import * as MathUtils from "./MathUtils.ts";
import { Vector2, Vector3 } from "./MathUtils.ts";

export const WHITE: Vec3Arr = [255,255,255];
export const BLACK: Vec3Arr = [0,0,0];
export const GRAY: Vec3Arr = [127,127,127];
export const RED: Vec3Arr = [255,0,0];
export const GREEN: Vec3Arr = [0,255,0];
export const BLUE: Vec3Arr = [0,0,255];

export function Init(runtime: IRuntime)
{

    singleton = new DebugDraw(runtime);

    let layers = runtime.layout.getAllLayers();
    let topLayerIndex = 0;
    if (layers.length > 0)
    {
        topLayerIndex = layers[layers.length-1].index;
    }

    let debugLayer = runtime.layout.getLayer(DEBUG_LAYER_NAME);
    if (debugLayer == null)
    {
        runtime.layout.addLayer(DEBUG_LAYER_NAME, runtime.layout.getLayer(topLayerIndex), "above");
    }
    else
    {
        runtime.layout.moveLayer(debugLayer, runtime.layout.getLayer(topLayerIndex), "above");
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

export function DrawPoint(x: number, y: number, z: number = 0, color: Vec3Arr = [255,0,0], opacity: number = 100, duration: number = 0, size: number = 2)
{
    DrawBox(x, y, z, size, size, 0, color, opacity, duration);
}

export function DrawLine(p0: Vector2, p1: Vector2, duration: number = 0, color: Vec3Arr = [255,0,0], opacity: number = 100, width: number = 0.5)
{
    let midpoint = p0.add(p1).multiply(0.5);
    let delta = p1.subtract(p0);
    let angle = Math.atan2(delta.y, delta.x) + Math.PI * 0.5;
    let length = delta.length();

    DrawBox(midpoint.x, midpoint.y, 0, width, length, angle * MathUtils.R2D, color, opacity, duration);
}

export function DrawVector(origin: Vector2, v: Vector2, duration: number = 0, color: Vec3Arr = [255,0,0], opacity: number = 100, width: number = 0.5)
{
    DrawLine(origin, origin.add(v), duration, color, opacity, width);
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

            let instance = this.runtime.objects.Box.createInstance(DEBUG_LAYER_NAME, 0, 0);
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