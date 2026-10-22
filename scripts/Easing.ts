const B1 = 1.0 / 2.75;
const B2 = 2.0 / 2.75;
const B3 = 1.5 / 2.75;
const B4 = 2.5 / 2.75;
const B5 = 2.25 / 2.75;
const B6 = 2.625 / 2.75;

/** Quadratic in. */
export function quad_in(t: number) : number
{
    return t * t;
}

/** Quadratic out. */
export function quad_out(t: number) : number
{
    return -t * (t - 2.0);
}

/** Quadratic in and out. */
export function quad_in_out(t: number) : number
{
    if (t <= 0.5)
    {
        return t * t * 2.0;
    } 
    else
    {
        t -= 1.0;
        return 1.0 - t * t * 2.0;
    }
}

/** Cubic in. */
export function cube_in(t: number) : number
{
    return t * t * t;
}

/** Cubic out. */
export function cube_out(t: number) : number
{
    t -= 1.0;
    return 1.0 + t * t * t;
}

/** Cubic in and out. */
export function cube_in_out(t: number) : number
{
    if (t <= 0.5)
    {
        return t * t * t * 4.0;
    }
    else
    {
        return (t - 1.0) * (2.0 * t - 2.0) * (2.0 * t - 2.0) + 1.0;
    }
}

/** Quart in. */
export function quart_in(t: number) : number
{
    return t * t * t * t;
}

/** Quart out. */
export function quart_out(t: number) : number
{
    t -= 1.0;
    return 1 - t * t * t * t;
}

/** Quart in and out. */
export function quart_in_out(t: number) : number
{
    if (t <= 0.5)
    {
        return t * t * t * t * 8.0;
    } 
    else
    {
        t = t * 2.0 - 2.0;
        return (1.0 - t * t * t * t) / 2.0 + 0.5;
    }
}

/** Quint in. */
export function quint_in(t: number) : number
{
    return t * t * t * t * t;
}

/** Quint out. */
export function quint_out(t: number) : number
{
    t = t - 1.0;
    return t * t * t * t * t + 1.0;
}

/** Quint in and out. */
export function quint_in_out(t: number) : number
{
    t *= 2.0;
    if (t < 1.0)
    {
        return (t* t * t * t * t) / 2.0;
    } 
    else
    {
        t -= 2.0;
        return (t * t * t * t * t + 2.0) / 2.0;
    }
}

/** Sine in. */
export function sine_in(t: number) : number
{
    return 1.0 - Math.cos(t *  Math.PI * 0.5);
}

/** Sine out. */
export function sine_out(t: number) : number
{
    return Math.sin(t * Math.PI * 0.5);
}

/** Sine in and out. */
export function sine_in_out(t: number) : number
{
    return (1.0 - Math.cos(t * Math.PI)) * 0.5;
}

/** Bounce in. */
export function bounce_in(t: number) : number
{
    t = 1.0 - t;
    if (t < B1) return 1.0 - 7.5625 * t* t;
    if (t < B2) return 1.0 - (7.5625 * (t - B3) * (t - B3) + 0.75);
    if (t < B4) return 1.0 - (7.5625 * (t - B5) * (t - B5) + 0.9375);
    return 1.0 - (7.5625 * (t - B6) * (t - B6) + 0.984375);
}

/** Bounce out. */
export function bounce_out(t: number) : number
{
    if (t < B1) return 7.5625 * t * t;
    if (t < B2) return 7.5625 * (t - B3) * (t - B3) + 0.75;
    if (t < B4) return 7.5625 * (t - B5) * (t - B5) + 0.9375;
    return 7.5625 * (t - B6) * (t - B6) + 0.984375;
}

/** Bounce in and out. */
export function bounce_in_out(t: number) : number
{
    if (t < 0.5)
    {
        t = 1.0 - t * 2.0;
        if (t < B1) return (1.0 - 7.5625 * t * t) / 2.0;
        if (t < B2) return (1.0 - (7.5625 * (t - B3) * (t - B3) + 0.75)) / 2.0;
        if (t < B4) return (1.0 - (7.5625 * (t - B5) * (t - B5) + 0.9375)) / 2.0;
        return (1.0 - (7.5625 * (t - B6) * (t - B6) + 0.984375)) / 2.0;
    }
    t = t * 2.0 - 1.0;
    if (t < B1) return (7.5625 * t * t) / 2.0 + 0.5;
    if (t < B2) return (7.5625 * (t - B3) * (t - B3) + 0.75) / 2.0 + 0.5;
    if (t < B4) return (7.5625 * (t - B5) * (t - B5) + 0.9375) / 2.0 + 0.5;
    return (7.5625 * (t - B6) * (t - B6) + .984375) / 2.0 + 0.5;
}

/** Circle in. */
export function circ_in(t: number) : number
{
    return -(Math.sqrt(1.0 - t * t) - 1.0);
}

/** Circle out. */
export function circ_out(t: number) : number
{
    return Math.sqrt(1.0 - (t - 1.0) * (t - 1.0));
}

/** Circle in and out. */
export function circ_in_out(t: number) : number
{
    return t <= 0.5 ? (Math.sqrt(1.0 - t * t * 4.0) - 1.0) / -2.0 : (Math.sqrt(1.0 - (t * 2.0 - 2.0) * (t * 2.0 - 2.0)) + 1.0) / 2.0;
}

/** Exponential in. */
export function expo_in(t: number) : number
{
    return Math.pow(2.0, 10.0 * (t - 1.0));
}

/** Exponential out. */
export function expo_out(t: number) : number
{
    return -Math.pow(2.0, -10.0 * t) + 1;
}

/** Exponential in and out. */
export function expo_in_out(t: number) : number
{
    return t < 0.5 ? Math.pow(2.0, 10.0 * (t * 2.0 - 1.0)) / 2.0 : (-Math.pow(2.0, -10.0 * (t * 2.0 - 1.0)) + 2.0) / 2.0;
}

/** Back in. */
export function back_in(t: number) : number
{
    return t * t * (2.70158 * t - 1.70158);
}

/** Back out. */
export function back_out(t: number) : number
{
    t -= 1.0;
    return 1.0 - t * t * (-2.70158 * t - 1.70158);
}

/** Back in and out. */
export function back_in_out(t: number) : number
{
    t *= 2.0;

    if (t < 1.0)
    {
        return t * t* (2.70158 * t - 1.70158) / 2.0;
    }
    else
    {
        t -= 2.0;
        return (1.0 - t * t * (-2.70158 * t - 1.70158)) / 2.0 + 0.5;
    }
}