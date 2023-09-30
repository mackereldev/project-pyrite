import { n as noop, a as assign, i as identity, c as create_ssr_component, b as createEventDispatcher, e as escape, v as validate_component, d as add_attribute, f as each, g as subscribe } from "../../chunks/ssr.js";
import { I as Icon, X as XMark, Q as QuestionMarkCircle, C as CheckCircle, a as InformationCircle, E as ExclamationCircle, b as XCircle, t as toastContainerStore } from "../../chunks/index2.js";
import { w as writable } from "../../chunks/index.js";
const is_client = typeof window !== "undefined";
let now = is_client ? () => window.performance.now() : () => Date.now();
let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;
const tasks = /* @__PURE__ */ new Set();
function run_tasks(now2) {
  tasks.forEach((task) => {
    if (!task.c(now2)) {
      tasks.delete(task);
      task.f();
    }
  });
  if (tasks.size !== 0)
    raf(run_tasks);
}
function loop(callback) {
  let task;
  if (tasks.size === 0)
    raf(run_tasks);
  return {
    promise: new Promise((fulfill) => {
      tasks.add(task = { c: callback, f: fulfill });
    }),
    abort() {
      tasks.delete(task);
    }
  };
}
const app = "";
function is_date(obj) {
  return Object.prototype.toString.call(obj) === "[object Date]";
}
function get_interpolator(a, b) {
  if (a === b || a !== a)
    return () => a;
  const type = typeof a;
  if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
    throw new Error("Cannot interpolate values of different type");
  }
  if (Array.isArray(a)) {
    const arr = b.map((bi, i) => {
      return get_interpolator(a[i], bi);
    });
    return (t) => arr.map((fn) => fn(t));
  }
  if (type === "object") {
    if (!a || !b)
      throw new Error("Object cannot be null");
    if (is_date(a) && is_date(b)) {
      a = a.getTime();
      b = b.getTime();
      const delta = b - a;
      return (t) => new Date(a + t * delta);
    }
    const keys = Object.keys(b);
    const interpolators = {};
    keys.forEach((key) => {
      interpolators[key] = get_interpolator(a[key], b[key]);
    });
    return (t) => {
      const result = {};
      keys.forEach((key) => {
        result[key] = interpolators[key](t);
      });
      return result;
    };
  }
  if (type === "number") {
    const delta = b - a;
    return (t) => a + t * delta;
  }
  throw new Error(`Cannot interpolate ${type} values`);
}
function tweened(value, defaults = {}) {
  const store = writable(value);
  let task;
  let target_value = value;
  function set(new_value, opts) {
    if (value == null) {
      store.set(value = new_value);
      return Promise.resolve();
    }
    target_value = new_value;
    let previous_task = task;
    let started = false;
    let {
      delay = 0,
      duration = 400,
      easing = identity,
      interpolate = get_interpolator
    } = assign(assign({}, defaults), opts);
    if (duration === 0) {
      if (previous_task) {
        previous_task.abort();
        previous_task = null;
      }
      store.set(value = target_value);
      return Promise.resolve();
    }
    const start = now() + delay;
    let fn;
    task = loop((now2) => {
      if (now2 < start)
        return true;
      if (!started) {
        fn = interpolate(value, new_value);
        if (typeof duration === "function")
          duration = duration(value, new_value);
        started = true;
      }
      if (previous_task) {
        previous_task.abort();
        previous_task = null;
      }
      const elapsed = now2 - start;
      if (elapsed > /** @type {number} */
      duration) {
        store.set(value = new_value);
        return false;
      }
      store.set(value = fn(easing(elapsed / duration)));
      return true;
    });
    return task.promise;
  }
  return {
    set,
    update: (fn, opts) => set(fn(target_value, value), opts),
    subscribe: store.subscribe
  };
}
const ToastElement = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { toast } = $$props;
  let progressBar;
  tweened(1, { duration: toast.duration, easing: identity });
  let colour = "bg-theme-200";
  let icon = QuestionMarkCircle;
  if (toast.severity === "success") {
    colour = "bg-emerald-200";
    icon = CheckCircle;
  } else if (toast.severity === "info") {
    colour = "bg-sky-200";
    icon = InformationCircle;
  } else if (toast.severity === "warning") {
    colour = "bg-yellow-200";
    icon = ExclamationCircle;
  } else if (toast.severity === "error") {
    colour = "bg-red-200";
    icon = XCircle;
  }
  createEventDispatcher();
  if ($$props.toast === void 0 && $$bindings.toast && toast !== void 0)
    $$bindings.toast(toast);
  return `<div class="flex h-20 w-96"><button class="${"relative flex flex-grow items-center gap-3 truncate rounded-lg px-4 " + escape(colour, true)}">${validate_component(Icon, "Icon").$$render(
    $$result,
    {
      src: icon,
      class: "h-8 w-8 stroke-zinc-600"
    },
    {},
    {}
  )} <div class="flex flex-grow flex-col items-start text-zinc-600"><div class="text-lg font-medium">${escape(toast.message)}</div> <div class="text-sm">${escape(toast.detail)}</div></div> ${validate_component(Icon, "Icon").$$render(
    $$result,
    {
      src: XMark,
      class: "h-7 w-7 stroke-neutral-800/20 stroke-2 transition-colors hover:stroke-neutral-600/50"
    },
    {},
    {}
  )} ${toast.expires ? `<div class="absolute bottom-0 left-0 h-1 bg-neutral-800/20"${add_attribute("this", progressBar, 0)}></div>` : ``}</button></div>`;
});
const ToastContainer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { toasts = [] } = $$props;
  const addToasts = (...toastData) => {
    toasts = toasts.concat(toastData);
  };
  if ($$props.toasts === void 0 && $$bindings.toasts && toasts !== void 0)
    $$bindings.toasts(toasts);
  if ($$props.addToasts === void 0 && $$bindings.addToasts && addToasts !== void 0)
    $$bindings.addToasts(addToasts);
  return `<div class="fixed bottom-0 right-0 z-10 flex flex-col-reverse gap-2 p-2">${each(toasts, (toast) => {
    return `${validate_component(ToastElement, "ToastElement").$$render($$result, { toast }, {}, {})}`;
  })}</div>`;
});
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $toastContainerStore, $$unsubscribe_toastContainerStore;
  $$unsubscribe_toastContainerStore = subscribe(toastContainerStore, (value) => $toastContainerStore = value);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${$$result.head += `<!-- HEAD_svelte-1izzbpy_START -->${$$result.title = `<title>Chat App</title>`, ""}<!-- HEAD_svelte-1izzbpy_END -->`, ""} ${validate_component(ToastContainer, "ToastContainer").$$render(
      $$result,
      { this: $toastContainerStore },
      {
        this: ($$value) => {
          $toastContainerStore = $$value;
          $$settled = false;
        }
      },
      {}
    )} ${slots.default ? slots.default({}) : ``}`;
  } while (!$$settled);
  $$unsubscribe_toastContainerStore();
  return $$rendered;
});
export {
  Layout as default
};
//# sourceMappingURL=_layout.svelte.js.map
