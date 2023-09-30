

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.33e9fe75.js","_app/immutable/chunks/scheduler.cb1169d2.js","_app/immutable/chunks/index.55e9778b.js","_app/immutable/chunks/index.358416fc.js","_app/immutable/chunks/index.daab3450.js","_app/immutable/chunks/navigation.eeea3a63.js","_app/immutable/chunks/singletons.258fba34.js"];
export const stylesheets = ["_app/immutable/assets/2.071c4a26.css"];
export const fonts = [];
