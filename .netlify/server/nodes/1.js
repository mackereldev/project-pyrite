

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.b31ca453.js","_app/immutable/chunks/scheduler.cb1169d2.js","_app/immutable/chunks/index.55e9778b.js","_app/immutable/chunks/singletons.258fba34.js","_app/immutable/chunks/index.daab3450.js","_app/immutable/chunks/navigation.eeea3a63.js"];
export const stylesheets = [];
export const fonts = [];
