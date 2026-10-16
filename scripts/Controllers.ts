import * as DebugDraw from "./DebugDraw.ts";
import * as MathUtils from "./MathUtils.ts";
import { Vector2, Vector3, Plane2D } from "./MathUtils.ts";

const DRAW_DEBUG = false;

export function SetupEvents(runtime: IRuntime)
{
    runtime.objects.Controllers.addEventListener("instancecreate", function (ev: InstanceEvent<InstanceType.Controllers>)
    {
        InitController(ev.instance);
    });
}

export function Tick(runtime: IRuntime)
{
    for (let c of runtime.objects.Controllers.getAllInstances())
    {
        TickController(c);
    }
}

function InitController(controller: InstanceType.Controllers)
{
}

interface MTV { normal: Vector2; depth: number; } // Minimum Translation Vector

function ComputeMTV(a: Corners, b: Corners, allStatics: Corners[]): MTV | null
{
    // Compute centers
    let centerA = new Vector2(0,0);
    let centerB = new Vector2(0,0);
    for (let i = 0; i < 4; ++i)
    {
        centerA = centerA.add(a[i]);
        centerB = centerB.add(b[i]);
    }
    centerA = centerA.multiply(0.25);
    centerB = centerB.multiply(0.25);

    let best: MTV | null = null;

    const testAxes = (poly: Corners, isCollider: boolean) =>
    {
        for (let i = 0; i < 2; ++i) // 2 axes are enough for a rectangle. Arbitrary convex polygon should probably use all edges
        {
            const edge = poly[(i + 1) % 4].subtract(poly[i]);
            let axis = new Vector2(edge.y, -edge.x).normalize();

            let minA = Infinity, maxA = -Infinity, minB = Infinity, maxB = -Infinity;
            for (const p of a) { const d = axis.dot(p); minA = Math.min(minA, d); maxA = Math.max(maxA, d); }
            for (const p of b) { const d = axis.dot(p); minB = Math.min(minB, d); maxB = Math.max(maxB, d); }

            const overlap = Math.min(maxA, maxB) - Math.max(minA, minB); // overlaping part of both ranges
            if (overlap <= 0) return false; // No separating axis, no collision

            if (!isCollider) continue; // Controller should never write in the translation vector, we only want collider aligned ejections

            // A is the moving one, so orient normal from B to A
            if (axis.dot(centerA.subtract(centerB)) < 0) axis = axis.multiply(-1);

            // Reject internal faces : does the B face that points towards axis is overlappend by another static rectangle ?
            if (IsInternalFace(b, axis, allStatics)) continue;

            if (best === null || overlap < best.depth)
            {
                best = { normal: axis, depth: overlap };
            }
        }
        return true;
    }

     // only one test of axes is not enough to guarantee collision, both must be true
    if (!testAxes(a, false)) return null;
    if (!testAxes(b, true)) return null;

    return best;
}

function TickController(c: InstanceType.Controllers)
{
    if (c.instVars.disabled) return;

    const excludedTags = c.instVars.excluded_collisions.split(",");
    const collidingClasses = [c.runtime.objects.Furniture, c.runtime.objects.Buildings];
    const collisionCandidates = c.runtime.collisions.getCollisionCandidates(collidingClasses, c.getBoundingBox()).filter((v) => !v.hasTags(...excludedTags));
    const candidateCorners = collisionCandidates.map(GetCorners);

    if (DRAW_DEBUG)
    {
        for (const col of collisionCandidates)
        {
            DrawCollider(col, 0, DebugDraw.BLUE);
        }
        DrawCollider(c, 0, DebugDraw.GREEN);
    }

    const SOLVER_ITERATIONS = 4;

    let collider: IWorldInstance | null = null;
    let collisionNormal = new Vector2(0,0);
    let collisionDepth = 0;
    for (let i = 0; i < SOLVER_ITERATIONS; ++i)
    {
        let best: MTV | null = null;
        let bestCollider: IWorldInstance | null = null;
        const controllerCorners = GetCorners(c);

        for (let j = 0; j < collisionCandidates.length; ++j)
        {
            const mtv = ComputeMTV(controllerCorners, candidateCorners[j], candidateCorners);
            if (mtv != null && (best === null || mtv.depth > best.depth))
            {
                best = mtv;
                bestCollider = collisionCandidates[j];
            }
        }
        if (best === null) break;

        const push = best.normal.multiply(best.depth + 0.001);
        c.x += push.x;
        c.y += push.y;

        if (collider == null)
        {
            collisionNormal = best.normal;
            collisionDepth = best.depth;
            collider = bestCollider;
        }
    }

    if (collider != null)
    {
        const movement = new Vector2(1, 0).rotate(c.angleDegrees).multiply(Math.sign(c.instVars.velocity));
        const contactPoint = ComputeContactPoint(GetCorners(c), collisionNormal);

        const BUMP_ANGLE = 35;
        
        const collisionAngle = Vector2.SignedAngleBetween(movement, collisionNormal.multiply(-1));
        if (Math.abs(collisionAngle) <= BUMP_ANGLE)
        {
            const collisionVelocity = c.instVars.velocity;
            c.instVars.velocity *= c.instVars.collision_velocity_multiplier;
            c.callCustomAction("OnBump", collisionAngle, collisionVelocity, contactPoint.x, contactPoint.y, collisionNormal.x, collisionNormal.y, collider.uid);
        }
        else
        {
            if (!c.instVars.isSliding)
            {
                c.instVars.isSliding = true;
                c.callCustomAction("OnSlideBegin", collisionAngle,  contactPoint.x, contactPoint.y, collisionNormal.x, collisionNormal.y, collider.uid);
            }

            c.callCustomAction("OnSlideTick", collisionAngle, contactPoint.x, contactPoint.y, collisionNormal.x, collisionNormal.y, collider.uid);
        }

        if (DRAW_DEBUG)
        {
            DebugDraw.DrawVector(contactPoint, collisionNormal.multiply(collisionDepth * 10), 3, DebugDraw.GREEN);
            // DrawCollider(collider, 3, DebugDraw.RED);
        }
    }
    else
    {
        if (c.instVars.isSliding)
        {
            c.callCustomAction("OnSlideEnd");
            c.instVars.isSliding = false;
        }
    }
    
    // Cooldowns
    /*
    if (c.instVars.turn_left_cooldown > 0) { c.instVars.turn_left_cooldown -= runtime.dt; }
    if (c.instVars.turn_right_cooldown > 0) { c.instVars.turn_right_cooldown -= runtime.dt; }

    if (c.instVars.left_angular_input_timer > 0)
    {
        c.instVars.left_angular_input_timer -= runtime.dt;
        if (c.instVars.left_angular_input_timer <= 0)
        {
            c.instVars.angular_velocity -= c.instVars.angular_acceleration;
        }
    }

    if (c.instVars.right_angular_input_timer > 0)
    {
        c.instVars.right_angular_input_timer -= runtime.dt;
        if (c.instVars.right_angular_input_timer <= 0)
        {
            c.instVars.angular_velocity += c.instVars.angular_acceleration;
        }
    }

    if (c.instVars.read_input)
    {
        if (c.instVars.rotate_ticks > 0)
        {
            c.instVars.right_angular_input_timer = c.instVars.angular_input_delay;
            if (c.instVars.turn_right_cooldown <= 0) 
            {
                c.instVars.turn_right_cooldown = c.instVars.angular_buffer_time;
            }
        }

        if (c.instVars.rotate_ticks < 0)
        {
            c.instVars.left_angular_input_timer = c.instVars.angular_input_delay;
            if (c.instVars.turn_left_cooldown <= 0) 
            {
                c.instVars.turn_left_cooldown = c.instVars.angular_buffer_time;
            }
        }
    }
    */
}

function DrawCollider(instance: IWorldInstance, duration: number = 0, color: Vec3Arr = [255,0,0])
{
    let instanceMidpoint = GetInstanceMidpoint(instance);
    DebugDraw.DrawBox(instanceMidpoint.x, instanceMidpoint.y, 0, instance.width, instance.height, instance.angleDegrees, color, 30, duration);
}

function GetInstanceMidpoint(instance: IWorldInstance) : Vector2
{
    let instanceBB = instance.getBoundingBox();
    return new Vector2((instanceBB.left + instanceBB.right) / 2, (instanceBB.top + instanceBB.bottom) / 2);
}

type Corners = Vector2[];

function GetCorners(inst: IWorldInstance): Corners
{
    const mid = GetInstanceMidpoint(inst);
    const hw = inst.width * 0.5, hh = inst.height * 0.5;
    const a = inst.angleDegrees;
    return [
        new Vector2( hw, -hh).rotate(a).add(mid),
        new Vector2( hw,  hh).rotate(a).add(mid),
        new Vector2(-hw,  hh).rotate(a).add(mid),
        new Vector2(-hw, -hh).rotate(a).add(mid),
    ];
}

function PointInOBB(p: Vector2, corners: Corners): boolean
{
    // Les 4 coins sont dans l'ordre : on teste les 2 axes du rectangle
    const o = corners[3];
    const u = corners[0].subtract(o);
    const v = corners[2].subtract(o);
    const d = p.subtract(o);
    const du = d.dot(u), dv = d.dot(v);
    return du >= 0 && du <= u.dot(u) && dv >= 0 && dv <= v.dot(v);
}

function IsInternalFace(b: Corners, normal: Vector2, allStatics: Corners[]): boolean
{
    for (let i = 0; i < 4; ++i)
    {
        const p0 = b[i], p1 = b[(i+1) % 4];
        const edge = p1.subtract(p0);
        const n = new Vector2(edge.y, -edge.x).normalize();
        if (n.dot(normal) < 0.999) continue; // if edges are not aligned, skip
        if (edge.lengthSquared() > (32 * 32)) continue; // we assume that edges greater than 4 squares are never internal faces (the bigger the edge, the more error prone probing is)

        // Test several points for leting partially overlapping edges pass (maybe too expensive)
        for (const t of [0.1, 0.5, 0.9])
        {
            const probe = p0.add(edge.multiply(t)).add(normal.multiply(0.5));
            // DebugDraw.DrawPoint(probe.x, probe.y, 0, DebugDraw.RED, 100, 3);
            let covered = false;
            for (const other of allStatics)
            {
                if (other === b) continue;
                if (!PointInOBB(probe, other)) continue;
                covered = true;
                break;
            }

            if (!covered) return false; // On point is exposed: face is (at least partially) exposed
        }
        return true; // 3 points covered: internal face
    }
    return false;
}

function ComputeContactPoint(a: Corners, normal: Vector2, eps = 0.01): Vector2
{
    let minDot = Infinity;
    for (const p of a) minDot = Math.min(minDot, normal.dot(p));

    let sum = new Vector2(0, 0), count = 0;
    for (const p of a)
    {
        if (normal.dot(p) <= minDot + eps) { sum = sum.add(p); count++; }
    }
    return sum.multiply(1 / count);
}