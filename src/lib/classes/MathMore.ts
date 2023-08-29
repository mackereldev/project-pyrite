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

// https://stackoverflow.com/a/55671924/14270868
export const weightedRandom = (options: { item: any; weight: number }[]) => {
    let i;
    const weights = [options[0].weight];

    for (i = 1; i < options.length; i++) {
        weights[i] = options[i].weight + weights[i - 1];
    }

    const random = Math.random() * weights[weights.length - 1];

    for (i = 0; i < weights.length; i++) {
        if (weights[i] > random) {
            break;
        }
    }

    return options[i].item;
};
