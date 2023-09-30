export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {"start":"_app/immutable/entry/start.6a9518f7.js","app":"_app/immutable/entry/app.7ca4d520.js","imports":["_app/immutable/entry/start.6a9518f7.js","_app/immutable/chunks/scheduler.cb1169d2.js","_app/immutable/chunks/singletons.258fba34.js","_app/immutable/chunks/index.daab3450.js","_app/immutable/entry/app.7ca4d520.js","_app/immutable/chunks/scheduler.cb1169d2.js","_app/immutable/chunks/index.55e9778b.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
}
})();
