import { h as getContext, c as create_ssr_component, g as subscribe, e as escape } from "../../chunks/ssr.js";
const getStores = () => {
  const stores = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
const Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let message;
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  const statusMessages = {
    404: "Page not found",
    401: "Unauthorized",
    500: "Internal error",
    502: "Bad gateway"
  };
  message = statusMessages[$page.status];
  $$unsubscribe_page();
  return `<div class="flex flex-col items-center justify-center gap-12"><div class="flex flex-row items-center justify-center gap-4"><h1 class="text-5xl font-light">${escape($page.status)}</h1> <div class="h-12 w-0.5 flex-grow bg-theme-200"></div> <span class="text-lg">${escape(message)}</span></div> <button class="btn absolute top-[60%]" data-svelte-h="svelte-1ew6uzt">Return Home</button></div>`;
});
export {
  Error$1 as default
};
//# sourceMappingURL=_error.svelte.js.map
