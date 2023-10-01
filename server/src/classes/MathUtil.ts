export const clamp = (value: number, min: number, max: number) => {
    return Math.max(Math.min(value, max), min);
};

// https://www.ronja-tutorials.com/post/047-invlerp_remap/#example-shader
export const lerp = (start: number, end: number, time: number) => {
    return (1 - time) * start + time * end;
};

// https://www.ronja-tutorials.com/post/047-invlerp_remap/#inverse-lerp
export const invLerp = (from: number, to: number, value: number) => {
    return (value - from) / (to - from);
};

// https://www.ronja-tutorials.com/post/047-invlerp_remap/#remap
export const remap = (origFrom: number, origTo: number, targetFrom: number, targetTo: number, value: number) => {
    const rel = invLerp(origFrom, origTo, value);
    return lerp(targetFrom, targetTo, rel);
};
