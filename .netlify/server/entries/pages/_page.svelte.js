import { j as get_store_value, c as create_ssr_component, g as subscribe, e as escape, d as add_attribute, o as onDestroy, f as each, v as validate_component, k as set_store_value } from "../../chunks/ssr.js";
import { w as writable } from "../../chunks/index.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { H as Home, c as clientStore, t as toastContainerStore, e as exportModalStore, p as preferencesModalStore, I as Icon, P as PaperAirplane, d as Clipboard, A as ArrowDownTray, f as Cog6Tooth, g as ArrowRightOnRectangle } from "../../chunks/index2.js";
import "export-to-csv";
function client_method(key) {
  {
    if (key === "before_navigate" || key === "after_navigate") {
      return () => {
      };
    } else {
      const name_lookup = {
        disable_scroll_handling: "disableScrollHandling",
        preload_data: "preloadData",
        preload_code: "preloadCode",
        invalidate_all: "invalidateAll"
      };
      return () => {
        throw new Error(`Cannot call ${name_lookup[key] ?? key}(...) on the server`);
      };
    }
  }
}
const beforeNavigate = /* @__PURE__ */ client_method("before_navigate");
class ChatMessage {
  author;
  type;
  text;
  isError;
  time;
  constructor(author, type, text, isError = false) {
    this.author = author;
    this.type = type;
    this.text = text;
    this.isError = isError;
    this.time = Date.now();
    dayjs.extend(utc);
  }
  getRelativeTime = (relativeStartTime) => {
    return dayjs.utc(this.time - relativeStartTime).format("HH:mm:ss");
  };
  serialize() {
    return ChatMessage.serialize(this);
  }
  static serialize(chatMessage) {
    return JSON.stringify(chatMessage);
  }
}
class Tab {
  name = writable();
  heroIcon;
  constructor(name, heroIcon) {
    this.name.set(name || "NULL");
    this.heroIcon = heroIcon;
  }
  dispose = async () => {
  };
}
const subscribeStoreDefer = (store, fn) => {
  let firedFirst = false;
  return store.subscribe((state) => {
    if (!firedFirst) {
      firedFirst = true;
    } else {
      fn(state);
    }
  });
};
const isNatural = (number) => {
  if (number) {
    return !!number.match(/^\d+$/);
  }
  return false;
};
const isInteger = (number) => {
  if (number) {
    return !!number.match(/^-?\d+$/);
  }
  return false;
};
class HomeTab extends Tab {
  constructor() {
    super("~HOME", Home);
  }
}
const tabsStore = writable([new HomeTab()]);
const currentTabIdx = writable(0);
const closeTab = async (tab) => {
  await tab.dispose();
  if (tab === get_store_value(tabsStore)[get_store_value(currentTabIdx)]) {
    currentTabIdx.update((index) => index > 0 ? index - 1 : 0);
  }
  tabsStore.update((value) => value.filter((t) => t !== tab));
};
const closeAllTabs = async () => {
  for (const tab of get_store_value(tabsStore)) {
    await closeTab(tab);
  }
};
class Cmd {
  args = {};
  context;
  clientData;
  constructor(context) {
    this.context = context;
    this.clientData = this.context.room.state.clientData.find((c) => c.sessionId === this.context.room.sessionId);
  }
  static help() {
    return;
  }
  static asSystem(text, isError = false) {
    return new ChatMessage(void 0, "system", text, isError);
  }
  static toInt(number, allowNegative = false) {
    const [name, value] = Object.entries(number)[0];
    if (isNatural(value) || allowNegative && isInteger(value)) {
      return parseInt(value);
    } else {
      const errorMessage = allowNegative ? `Argument '${name}' must be a whole number.` : `Argument '${name}' must be a positive whole number.`;
      throw new CmdError(errorMessage);
    }
  }
  static toEnum(string, options) {
    const [name, value] = Object.entries(string)[0];
    if (options.includes(value)) {
      return value;
    } else {
      throw new CmdError(`Argument '${name}' must be one of: ${options.map((opt) => `'${opt}'`).join(", ")}.`);
    }
  }
}
class CmdContext {
  room;
  chatTab;
  constructor(room, chatTab) {
    this.room = room;
    this.chatTab = chatTab;
  }
}
class CmdError {
  name = "CmdError";
  message;
  stack;
  cause;
  constructor(message) {
    this.message = message;
  }
}
class PingCmd extends Cmd {
  args;
  constructor(context, delay) {
    super(context);
    this.args = {
      delay: Cmd.toInt({ delay })
    };
  }
  execute() {
    this.context.room.send("cmd-ping", { delay: this.args.delay });
    return;
  }
}
class LeaveCmd extends Cmd {
  constructor(context) {
    super(context);
  }
  async execute() {
    await closeTab(this.context.chatTab);
    return;
  }
}
class CommandDispatcher {
  chatTab;
  roomStore;
  constructor(chatTab) {
    this.chatTab = chatTab;
    this.roomStore = chatTab.roomStore;
  }
  executeCommand = async (commandName, ...args) => {
    const err = (message) => {
      return new ChatMessage(void 0, "system", message, true);
    };
    try {
      if (Object.keys(commandRefs).includes(commandName)) {
        const context = new CmdContext(get_store_value(this.roomStore), this.chatTab);
        return await commandRefs[commandName](context, ...args).execute();
      } else {
        return err(`Command '${commandName}' could not be found.`);
      }
    } catch (error) {
      if (error instanceof CmdError) {
        return err(error.message);
      } else if (error instanceof Error) {
        console.error(error);
      } else {
        console.error(error);
      }
      return err("An unknown error occurred.");
    }
  };
}
const commandRefs = {
  ping: (context, ...args) => new PingCmd(context, args[0]),
  leave: (context) => new LeaveCmd(context)
};
class ToastData {
  static DEFAULT_DURATIONS = {
    success: 5e3,
    info: 5e3,
    warning: 8e3,
    error: 12e3
  };
  severity;
  message;
  detail;
  _duration;
  get duration() {
    return this._duration === "disabled" ? -1 : this._duration === "auto" ? this.evaluateAutoDuration() : this._duration;
  }
  get expires() {
    return this.duration >= 0;
  }
  constructor(severity = "info", message = "Message", detail = "Detail", duration = "auto") {
    this.severity = severity;
    this.message = message;
    this.detail = detail;
    this._duration = duration;
  }
  evaluateAutoDuration = () => {
    return ToastData.DEFAULT_DURATIONS[this.severity];
  };
  clone = () => {
    return new ToastData(this.severity, this.message, this.detail, this._duration);
  };
}
var AutoScrollBehaviour = /* @__PURE__ */ ((AutoScrollBehaviour2) => {
  AutoScrollBehaviour2[AutoScrollBehaviour2["Always"] = 0] = "Always";
  AutoScrollBehaviour2[AutoScrollBehaviour2["OnlySelf"] = 1] = "OnlySelf";
  AutoScrollBehaviour2[AutoScrollBehaviour2["Never"] = 2] = "Never";
  return AutoScrollBehaviour2;
})(AutoScrollBehaviour || {});
var ChatStyle = /* @__PURE__ */ ((ChatStyle2) => {
  ChatStyle2[ChatStyle2["Cozy"] = 0] = "Cozy";
  ChatStyle2[ChatStyle2["Compact"] = 1] = "Compact";
  return ChatStyle2;
})(ChatStyle || {});
var ExportTimeRange = /* @__PURE__ */ ((ExportTimeRange2) => {
  ExportTimeRange2[ExportTimeRange2["FifteenMinutes"] = 0] = "FifteenMinutes";
  ExportTimeRange2[ExportTimeRange2["OneHour"] = 1] = "OneHour";
  ExportTimeRange2[ExportTimeRange2["SixHours"] = 2] = "SixHours";
  ExportTimeRange2[ExportTimeRange2["Today"] = 3] = "Today";
  ExportTimeRange2[ExportTimeRange2["All"] = 4] = "All";
  return ExportTimeRange2;
})(ExportTimeRange || {});
class Preferences {
  username = writable("");
  chatStyle = writable(ChatStyle.Cozy);
  autoScrollBehaviour = writable(AutoScrollBehaviour.OnlySelf);
  darkMode = writable(false);
  joinLeaveMessages = writable(true);
  constructor() {
    for (const key in this) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        const prop = this[key];
        if (prop.subscribe) {
          const store = prop;
          subscribeStoreDefer(store, (value) => {
            const oldStorage = JSON.parse(localStorage.getItem("preferences") || "{}");
            oldStorage[key] = value;
            localStorage.setItem("preferences", JSON.stringify(oldStorage));
          });
        }
      }
    }
    subscribeStoreDefer(this.darkMode, (value) => {
      if (value) {
        if (!document.documentElement.classList.contains("dark")) {
          document.documentElement.classList.add("dark");
        }
      } else {
        if (document.documentElement.classList.contains("dark")) {
          document.documentElement.classList.remove("dark");
        }
      }
    });
  }
  static loadPrefs = () => {
    const prefs = new Preferences();
    return prefs;
  };
}
const preferences = Preferences.loadPrefs();
class ChatTab extends Tab {
  roomStore = writable();
  commandDispatcher = new CommandDispatcher(this);
  messages = writable([]);
  clients = writable([]);
  lastReadMessage;
  isUnread = writable(false);
  effectiveUsername = writable("");
  acceptingJoinMessages = false;
  constructor(code) {
    super();
    if (code) {
      this.join(code);
    } else {
      this.create();
    }
  }
  addMessage = (message) => {
    this.messages.update((current) => current.concat(message));
    if (get_store_value(tabsStore)[get_store_value(currentTabIdx)] !== this) {
      this.isUnread.set(true);
    }
  };
  create = () => {
    get_store_value(clientStore).create("chat-room", { clientId: get_store_value(preferences.username) }).then((room) => this.initialiseRoom(room)).catch((err) => this.handleError(err));
  };
  join = (code) => {
    get_store_value(clientStore).joinById(code, { clientId: get_store_value(preferences.username) }).then((room) => this.initialiseRoom(room)).catch((err) => this.handleError(err));
  };
  initialiseRoom = (room) => {
    this.roomStore.set(room);
    this.name.set(room.roomId);
    room.onLeave(() => {
      this.dispose();
    });
    if (process.env.NODE_ENV === "development") {
      room.onMessage("__playground_message_types", (message) => {
        console.debug("Playground message types", message);
      });
    }
    room.state.clientData.onAdd((client) => {
      this.clients.update((clients) => clients.concat({ clientId: client.clientId, sessionId: client.sessionId, isLeader: get_store_value(this.roomStore).state.leader === client.clientId }));
      if (client.sessionId === get_store_value(this.roomStore).sessionId) {
        this.acceptingJoinMessages = true;
        this.effectiveUsername.set(client.clientId);
      }
      if (this.acceptingJoinMessages && get_store_value(preferences.joinLeaveMessages)) {
        this.addMessage(new ChatMessage(void 0, "system", `${client.clientId} joined the room.`));
      }
    });
    room.state.clientData.onRemove((client) => {
      this.clients.update((clients) => clients.filter((value) => client.sessionId !== value.sessionId));
      if (get_store_value(preferences.joinLeaveMessages)) {
        this.addMessage(new ChatMessage(void 0, "system", `${client.clientId} left the room.`));
      }
    });
    room.onMessage("server-chat", (message) => {
      const chat = (msg) => {
        const chatMessage = new ChatMessage(void 0, "system", msg.serializedMessage.text, msg.serializedMessage.isError);
        this.addMessage(chatMessage);
      };
      if (Array.isArray(message)) {
        message.forEach((subMessage) => chat(subMessage));
      } else {
        chat(message);
      }
    });
    room.onMessage("client-chat", (message) => {
      const { msg, author } = message;
      console.debug("MESSAGE:", message);
      this.addMessage(new ChatMessage(author.clientId, "user", msg));
    });
  };
  handleError = (err) => {
    const toastContainer = get_store_value(toastContainerStore);
    if (err.code === 4101) {
      toastContainer.addToasts(new ToastData("error", "Unable to Join", "Username was taken"));
    } else if (err.code === 4121) {
      toastContainer.addToasts(new ToastData("error", "Unable to Join", "Username is too long"));
    } else if (err.code === 4122) {
      toastContainer.addToasts(new ToastData("error", "Unable to Join", "Username contains illegal characters"));
    } else if (err.code === 4212) {
      toastContainer.addToasts(new ToastData("error", "Unable to Join", "Room does not exist or is full"));
    }
    console.error(`Colyseus error (${err.code}): ${err.message}`);
    closeTab(this);
  };
  dispose = async () => {
    const room = get_store_value(this.roomStore);
    if (room) {
      room.removeAllListeners();
      if (room.connection.isOpen) {
        await room.leave(true);
      }
    }
  };
}
const ChatItem = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $chatStyle, $$unsubscribe_chatStyle;
  let { chatTab } = $$props;
  let { message } = $$props;
  let { relativeStartTime } = $$props;
  let { unreadIndicator = false } = $$props;
  let messageContent;
  let colour = "text-theme-500";
  let author = "invalid";
  if (message.type === "user") {
    colour = "text-violet-500";
    author = message.author || "invalid";
  } else if (message.type === "system") {
    colour = "text-sky-500";
    author = "SYSTEM";
  }
  const chatStyle = preferences.chatStyle;
  $$unsubscribe_chatStyle = subscribe(chatStyle, (value) => $chatStyle = value);
  if ($$props.chatTab === void 0 && $$bindings.chatTab && chatTab !== void 0)
    $$bindings.chatTab(chatTab);
  if ($$props.message === void 0 && $$bindings.message && message !== void 0)
    $$bindings.message(message);
  if ($$props.relativeStartTime === void 0 && $$bindings.relativeStartTime && relativeStartTime !== void 0)
    $$bindings.relativeStartTime(relativeStartTime);
  if ($$props.unreadIndicator === void 0 && $$bindings.unreadIndicator && unreadIndicator !== void 0)
    $$bindings.unreadIndicator(unreadIndicator);
  $$unsubscribe_chatStyle();
  return `<div class="${escape($chatStyle === ChatStyle.Cozy ? "text-base" : "text-sm", true) + " " + escape(unreadIndicator ? " unread-msg-shadow" : "", true) + escape(
    "",
    true
  )}"><span class="font-mono text-theme-400">${escape(message.getRelativeTime(relativeStartTime))}</span> <span class="${"font-semibold " + escape(colour, true)}">[${escape(author)}]</span> <span class="${"whitespace-pre-wrap " + escape(
    message.type === "system" ? "italic text-theme-400" : "not-italic",
    true
  ) + escape(message.isError ? " !text-red-400" : "", true)}"${add_attribute("this", messageContent, 0)}></span></div>`;
});
const ChatTabContent = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let commands;
  let $roomName, $$unsubscribe_roomName;
  let $effectiveUsername, $$unsubscribe_effectiveUsername;
  let $$unsubscribe_autoScrollBehaviour;
  let $chatStyle, $$unsubscribe_chatStyle;
  let $messages, $$unsubscribe_messages;
  let $$unsubscribe_exportModalStore;
  let $$unsubscribe_preferencesModalStore;
  let $clients, $$unsubscribe_clients;
  $$unsubscribe_exportModalStore = subscribe(exportModalStore, (value) => value);
  $$unsubscribe_preferencesModalStore = subscribe(preferencesModalStore, (value) => value);
  let { chatTab } = $$props;
  const roomName = chatTab.name;
  $$unsubscribe_roomName = subscribe(roomName, (value) => $roomName = value);
  let messageElement;
  let messageValue = "";
  let messageHistory;
  let showShadow;
  const messages = chatTab.messages;
  $$unsubscribe_messages = subscribe(messages, (value) => $messages = value);
  const effectiveUsername = chatTab.effectiveUsername;
  $$unsubscribe_effectiveUsername = subscribe(effectiveUsername, (value) => $effectiveUsername = value);
  const clients = chatTab.clients;
  $$unsubscribe_clients = subscribe(clients, (value) => $clients = value);
  let messagesStoreUnsubscribe;
  let copyRoomIDButton;
  let copyRoomIDButtonTooltip;
  let copyRoomIDButtonTooltipArrow;
  const chatStyle = preferences.chatStyle;
  $$unsubscribe_chatStyle = subscribe(chatStyle, (value) => $chatStyle = value);
  const autoScrollBehaviour = preferences.autoScrollBehaviour;
  $$unsubscribe_autoScrollBehaviour = subscribe(autoScrollBehaviour, (value) => value);
  onDestroy(() => {
    messagesStoreUnsubscribe();
  });
  if ($$props.chatTab === void 0 && $$bindings.chatTab && chatTab !== void 0)
    $$bindings.chatTab(chatTab);
  commands = Object.keys(commandRefs);
  $$unsubscribe_roomName();
  $$unsubscribe_effectiveUsername();
  $$unsubscribe_autoScrollBehaviour();
  $$unsubscribe_chatStyle();
  $$unsubscribe_messages();
  $$unsubscribe_exportModalStore();
  $$unsubscribe_preferencesModalStore();
  $$unsubscribe_clients();
  return ` <div class="flex w-full flex-grow flex-row"><div class="flex flex-1 flex-col overflow-clip border-r-2 border-theme-300"><div class="${escape($chatStyle === ChatStyle.Cozy ? "gap-1.5" : "gap-0.5", true) + " flex flex-grow basis-0 flex-col overflow-y-scroll break-words px-3 pt-3"}"${add_attribute("this", messageHistory, 0)}>${each($messages, (message, i) => {
    return `${validate_component(ChatItem, "ChatItem").$$render(
      $$result,
      {
        chatTab,
        message,
        unreadIndicator: i !== $messages.length - 1 && chatTab.lastReadMessage === message,
        relativeStartTime: get_store_value(chatTab.roomStore).state.serverStartTime
      },
      {},
      {}
    )}`;
  })}</div> <form class="${"p-4 transition-shadow duration-150 " + escape(showShadow, true)}"><div class="flex h-8 w-full rounded bg-theme-100 ring-2 ring-theme-300"> <input type="text" autofocus placeholder="${"Message " + escape($roomName, true)}" class="h-full flex-grow bg-transparent pl-2 text-sm placeholder:text-theme-300"${add_attribute("this", messageElement, 0)}${add_attribute("value", messageValue, 0)}> <button class="group aspect-square h-full py-1.5">${validate_component(Icon, "Icon").$$render(
    $$result,
    {
      src: PaperAirplane,
      class: "stroke-theme-300 stroke-2 transition-colors group-hover:stroke-theme-400"
    },
    {},
    {}
  )}</button></div></form></div> <div class="flex w-80 flex-col"><div class="flex h-8 border-b-2 border-theme-300"><button title="Copy Room ID" class="group flex-grow py-1 transition-colors hover:bg-theme-200"${add_attribute("this", copyRoomIDButton, 0)}>${validate_component(Icon, "Icon").$$render(
    $$result,
    {
      src: Clipboard,
      class: "stroke-theme-400 stroke-2 transition-colors group-hover:stroke-theme-500"
    },
    {},
    {}
  )}</button> <div class="${"pointer-events-none absolute rounded-lg px-2 py-1 opacity-0 drop-shadow-sm transition-opacity duration-150 " + escape(
    "bg-theme-200 text-theme-500",
    true
  )}"${add_attribute("this", copyRoomIDButtonTooltip, 0)}>${escape("Unable to copy")} <div class="${"absolute h-2 w-2 rotate-45 " + escape(
    "bg-theme-200",
    true
  )}"${add_attribute("this", copyRoomIDButtonTooltipArrow, 0)}></div></div> <button title="Export Chat History" class="group flex-grow py-1 transition-colors hover:bg-theme-200">${validate_component(Icon, "Icon").$$render(
    $$result,
    {
      src: ArrowDownTray,
      class: "stroke-theme-400 stroke-2 transition-colors group-hover:stroke-theme-500"
    },
    {},
    {}
  )}</button> <button title="Preferences" class="group flex-grow py-1 transition-colors hover:bg-theme-200">${validate_component(Icon, "Icon").$$render(
    $$result,
    {
      src: Cog6Tooth,
      class: "stroke-theme-400 stroke-2 transition-colors group-hover:stroke-theme-500"
    },
    {},
    {}
  )}</button> <button title="Leave Room" class="group flex-grow py-1 transition-colors hover:bg-theme-200">${validate_component(Icon, "Icon").$$render(
    $$result,
    {
      src: ArrowRightOnRectangle,
      class: "stroke-red-500/50 stroke-2 transition-colors group-hover:stroke-red-500/80"
    },
    {},
    {}
  )}</button></div> <div class="flex flex-1 flex-col overflow-clip border-b border-theme-300 p-5"><span class="border-b-2 border-theme-300 pb-2 text-2xl" data-svelte-h="svelte-vptl5z">Members</span> <div class="flex flex-col overflow-y-scroll">${each($clients, (client) => {
    return `<div class="flex p-4">${client.isLeader ? `<span class="mr-2" data-svelte-h="svelte-12oqtbz"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-6 w-6 fill-amber-400 stroke-amber-400 stroke-2"><path d="M4 19H20M11.2929 5.70711L8.70711 8.2929C8.31658 8.68342 7.68342 8.68342 7.29289 8.2929L5.70711 6.70711C5.07714 6.07714 4 6.52331 4 7.41422V15C4 15.5523 4.44772 16 5 16H19C19.5523 16 20 15.5523 20 15V7.41421C20 6.52331 18.9229 6.07714 18.2929 6.70711L16.7071 8.2929C16.3166 8.68342 15.6834 8.68342 15.2929 8.2929L12.7071 5.70711C12.3166 5.31658 11.6834 5.31658 11.2929 5.70711Z" stroke-linecap="round" stroke-linejoin="round"></path></svg> </span>` : `<span class="mr-2" data-svelte-h="svelte-1aiq0ro"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-6 w-6 fill-none stroke-theme-400 stroke-2"><path d="M17.5 21.0001H6.5C5.11929 21.0001 4 19.8808 4 18.5001C4 14.4194 10 14.5001 12 14.5001C14 14.5001 20 14.4194 20 18.5001C20 19.8808 18.8807 21.0001 17.5 21.0001Z" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke-linecap="round" stroke-linejoin="round"></path></svg> </span>`} <span class="${"truncate font-bold " + escape(
      client.clientId === $effectiveUsername ? " text-violet-500" : "",
      true
    )}">${escape(client.clientId)}</span> </div>`;
  })}</div></div> <div class="flex flex-1 flex-col overflow-clip border-t border-theme-300 p-5"><span class="border-b-2 border-theme-300 pb-2 text-2xl" data-svelte-h="svelte-1deyqp8">Commands</span> <div class="flex flex-col overflow-y-scroll">${each(commands, (command) => {
    return `<button class="mt-2 flex"><div class="w-full rounded-lg px-3 py-2 text-start ring-2 ring-inset ring-theme-200">${escape(command)}</div> </button>`;
  })}</div></div></div></div>`;
});
const TabButton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $tabName, $$unsubscribe_tabName;
  let $isUnread, $$unsubscribe_isUnread;
  let { tab } = $$props;
  let { isCurrentTab } = $$props;
  const tabName = tab.name;
  $$unsubscribe_tabName = subscribe(tabName, (value) => $tabName = value);
  const isUnread = tab?.isUnread;
  $$unsubscribe_isUnread = subscribe(isUnread, (value) => $isUnread = value);
  if ($$props.tab === void 0 && $$bindings.tab && tab !== void 0)
    $$bindings.tab(tab);
  if ($$props.isCurrentTab === void 0 && $$bindings.isCurrentTab && isCurrentTab !== void 0)
    $$bindings.isCurrentTab(isCurrentTab);
  $$unsubscribe_tabName();
  $$unsubscribe_isUnread();
  return `<button class="group relative flex cursor-pointer border-x border-theme-200 first:border-l-0 first:border-l-transparent last:border-r-2"><div class="${"flex h-full flex-grow items-center " + escape(tab.heroIcon === void 0 ? "px-4" : "px-1", true) + " text-sm font-semibold shadow-[0_2px] transition-all group-hover:bg-theme-200 " + escape(
    isCurrentTab ? "stroke-violet-500 text-violet-500 shadow-violet-500" : "stroke-theme-400 text-theme-400 shadow-transparent group-hover:stroke-theme-500 group-hover:text-theme-500",
    true
  )}">${tab.heroIcon !== void 0 ? `${validate_component(Icon, "Icon").$$render(
    $$result,
    {
      src: Home,
      class: "h-5 w-5 cursor-pointer fill-none"
    },
    {},
    {}
  )}` : `${escape($tabName)}`}</div> ${tab instanceof ChatTab ? `${$isUnread ? `<div class="absolute left-1 top-1 h-1.5 w-1.5 rounded-full bg-violet-400"></div>` : ``}` : ``}</button>`;
});
const Modal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let dialog;
  const open = () => {
    if (!dialog.open) {
      dialog.showModal();
    }
  };
  const close = () => {
    if (dialog.open)
      ;
  };
  if ($$props.open === void 0 && $$bindings.open && open !== void 0)
    $$bindings.open(open);
  if ($$props.close === void 0 && $$bindings.close && close !== void 0)
    $$bindings.close(close);
  return `  <dialog class="rounded-lg bg-theme-100"${add_attribute("this", dialog, 0)}>${slots.default ? slots.default({}) : ``}</dialog>`;
});
const PreferencesModal_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: ".pref-option.svelte-x48ymb{display:flex;justify-content:space-between\n}",
  map: null
};
const PreferencesModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_chatStyle;
  let $$unsubscribe_autoScrollBehaviour;
  let $darkMode, $$unsubscribe_darkMode;
  let $joinLeaveMessages, $$unsubscribe_joinLeaveMessages;
  let modal;
  const open = () => modal.open();
  const close = () => modal.close();
  const chatStyle = preferences.chatStyle;
  $$unsubscribe_chatStyle = subscribe(chatStyle, (value) => value);
  const autoScrollBehaviour = preferences.autoScrollBehaviour;
  $$unsubscribe_autoScrollBehaviour = subscribe(autoScrollBehaviour, (value) => value);
  const darkMode = preferences.darkMode;
  $$unsubscribe_darkMode = subscribe(darkMode, (value) => $darkMode = value);
  const joinLeaveMessages = preferences.joinLeaveMessages;
  $$unsubscribe_joinLeaveMessages = subscribe(joinLeaveMessages, (value) => $joinLeaveMessages = value);
  if ($$props.open === void 0 && $$bindings.open && open !== void 0)
    $$bindings.open(open);
  if ($$props.close === void 0 && $$bindings.close && close !== void 0)
    $$bindings.close(close);
  $$result.css.add(css$1);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      { this: modal },
      {
        this: ($$value) => {
          modal = $$value;
          $$settled = false;
        }
      },
      {
        default: () => {
          return `<div class="flex w-96 flex-col p-6"><h2 class="mb-6 text-center text-2xl" data-svelte-h="svelte-14tcnn2">Preferences</h2> <form class="flex flex-col gap-2"><div class="pref-option svelte-x48ymb"><label for="chat-style" data-svelte-h="svelte-ads1sv">Chat style</label> <select id="chat-style"><option${add_attribute("value", ChatStyle.Cozy, 0)} data-svelte-h="svelte-1glycd7">Cozy</option><option${add_attribute("value", ChatStyle.Compact, 0)} data-svelte-h="svelte-1sy8qqj">Compact</option></select></div> <div class="pref-option svelte-x48ymb"><label for="auto-scroll-behaviour" data-svelte-h="svelte-5825l2">Auto scroll behaviour</label> <select id="auto-scroll-behaviour"><option${add_attribute("value", AutoScrollBehaviour.Always, 0)} data-svelte-h="svelte-1yqsqol">Always</option><option${add_attribute("value", AutoScrollBehaviour.OnlySelf, 0)} data-svelte-h="svelte-xbzdsf">Only Self</option><option${add_attribute("value", AutoScrollBehaviour.Never, 0)} data-svelte-h="svelte-1s1jf3">Never</option></select></div> <div class="pref-option svelte-x48ymb"><label for="dark-mode" data-svelte-h="svelte-x2dsbx">Dark mode</label> <input id="dark-mode" type="checkbox"${add_attribute("checked", $darkMode, 1)}></div> <div class="pref-option svelte-x48ymb"><label for="join-leave-messages" data-svelte-h="svelte-1dwlq3q">Join &amp; leave messages</label> <input id="join-leave-messages" type="checkbox"${add_attribute("checked", $joinLeaveMessages, 1)}></div></form></div>`;
        }
      }
    )}`;
  } while (!$$settled);
  $$unsubscribe_chatStyle();
  $$unsubscribe_autoScrollBehaviour();
  $$unsubscribe_darkMode();
  $$unsubscribe_joinLeaveMessages();
  return $$rendered;
});
const Input = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { minlength = -524288 } = $$props;
  let { maxlength = 524288 } = $$props;
  let { min = "" } = $$props;
  let { max = "" } = $$props;
  let { placeholder = "" } = $$props;
  let { required = false } = $$props;
  let { omitRingStyle = false } = $$props;
  let { disable1Password = true } = $$props;
  let { value = "" } = $$props;
  let { element = null } = $$props;
  if ($$props.minlength === void 0 && $$bindings.minlength && minlength !== void 0)
    $$bindings.minlength(minlength);
  if ($$props.maxlength === void 0 && $$bindings.maxlength && maxlength !== void 0)
    $$bindings.maxlength(maxlength);
  if ($$props.min === void 0 && $$bindings.min && min !== void 0)
    $$bindings.min(min);
  if ($$props.max === void 0 && $$bindings.max && max !== void 0)
    $$bindings.max(max);
  if ($$props.placeholder === void 0 && $$bindings.placeholder && placeholder !== void 0)
    $$bindings.placeholder(placeholder);
  if ($$props.required === void 0 && $$bindings.required && required !== void 0)
    $$bindings.required(required);
  if ($$props.omitRingStyle === void 0 && $$bindings.omitRingStyle && omitRingStyle !== void 0)
    $$bindings.omitRingStyle(omitRingStyle);
  if ($$props.disable1Password === void 0 && $$bindings.disable1Password && disable1Password !== void 0)
    $$bindings.disable1Password(disable1Password);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.element === void 0 && $$bindings.element && element !== void 0)
    $$bindings.element(element);
  return `<input${add_attribute("minlength", minlength, 0)}${add_attribute("maxlength", maxlength, 0)}${add_attribute("min", min, 0)}${add_attribute("max", max, 0)}${add_attribute("placeholder", placeholder, 0)} ${required ? "required" : ""}${add_attribute("data-1p-ignore", disable1Password, 0)} class="${escape($$props.class || "", true) + " h-7 w-64 bg-theme-100 px-3 text-lg font-medium placeholder:text-theme-300 " + escape(
    omitRingStyle ? "transition-all duration-75" : "ring-input",
    true
  )}"${add_attribute("this", element, 0)}${add_attribute("value", value, 0)}>`;
});
const HomeTabContent = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_toastContainerStore;
  let $username, $$unsubscribe_username;
  let $$unsubscribe_preferencesModalStore;
  $$unsubscribe_toastContainerStore = subscribe(toastContainerStore, (value) => value);
  $$unsubscribe_preferencesModalStore = subscribe(preferencesModalStore, (value) => value);
  let roomIdValue;
  const username = preferences.username;
  $$unsubscribe_username = subscribe(username, (value) => $username = value);
  username.subscribe((value) => {
    set_store_value(username, $username = value.replace(/[^\x20-\x7F]/g, ""), $username);
  });
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `<div class="relative flex flex-grow flex-col items-center justify-center gap-20"><button class="group absolute left-4 top-4 h-9 w-9 rounded-lg bg-theme-100 p-1.5 ring-2 ring-inset ring-theme-200 transition-all hover:bg-theme-200 hover:ring-violet-500">${validate_component(Icon, "Icon").$$render(
      $$result,
      {
        src: Cog6Tooth,
        class: "stroke-theme-300 stroke-2 transition-colors group-hover:stroke-violet-500"
      },
      {},
      {}
    )}</button> <div class="absolute right-4 top-4 flex flex-col"><span data-svelte-h="svelte-9difb2">Username</span> ${validate_component(Input, "Input").$$render(
      $$result,
      {
        placeholder: "Anonymous",
        maxlength: 24,
        value: $username
      },
      {
        value: ($$value) => {
          $username = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div> <div class="flex flex-col items-center" data-svelte-h="svelte-1fg4ntf"><h1 class="text-3xl">Welcome to <span class="text-amber-500">Pyrite</span></h1> <p>A messaging app</p></div> <div class="flex w-48 flex-col items-center gap-6"><button class="btn w-full" data-svelte-h="svelte-gr33t">Create a room</button> <p class="text-lg" data-svelte-h="svelte-a2zhlr">OR</p> <div class="flex flex-col items-center"><p class="mb-2" data-svelte-h="svelte-eq5gap">Join an existing one</p> <div class="flex flex-col gap-2"><form class="ring-input flex h-fit flex-row overflow-clip"> ${validate_component(Input, "Input").$$render(
      $$result,
      {
        placeholder: "Enter Code",
        id: "room-id-input",
        maxlength: 4,
        omitRingStyle: true,
        class: "h-9 w-full flex-grow text-center",
        value: roomIdValue
      },
      {
        value: ($$value) => {
          roomIdValue = $$value;
          $$settled = false;
        }
      },
      {}
    )} <button type="submit" class="group box-content flex w-8 items-center bg-theme-100 px-0.5 transition-colors hover:bg-violet-500" data-svelte-h="svelte-3efegp"><svg viewBox="0 0 24 24" class="fill-theme-400 transition-colors group-hover:fill-theme-100"><path d="M12.1714 10.9998L7.51451 6.34292L8.92872 4.92871L15.9998 11.9998L8.92872 19.0708L7.51451 17.6566L12.1713 12.9998L2.99953 12.9999L2.99951 10.9999L12.1714 10.9998ZM17.9996 18.9997L17.9996 4.99972H19.9996L19.9996 18.9997H17.9996Z"></path></svg></button></form></div></div></div></div>`;
  } while (!$$settled);
  $$unsubscribe_toastContainerStore();
  $$unsubscribe_username();
  $$unsubscribe_preferencesModalStore();
  return $$rendered;
});
class ExportOptions {
  timeRange;
  excludeSystemMessages;
  constructor(timeRange = 0, excludeSystemMessages = false) {
    this.timeRange = timeRange;
    this.excludeSystemMessages = excludeSystemMessages;
  }
}
const ExportModal_svelte_svelte_type_style_lang = "";
const css = {
  code: ".pref-option.svelte-x48ymb{display:flex;justify-content:space-between\n}",
  map: null
};
const ExportModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_toastContainerStore;
  $$unsubscribe_toastContainerStore = subscribe(toastContainerStore, (value) => value);
  let modal;
  let context;
  let options;
  const open = (chatTab) => {
    context = chatTab;
    options = new ExportOptions();
    modal.open();
  };
  const close = () => modal.close();
  if ($$props.open === void 0 && $$bindings.open && open !== void 0)
    $$bindings.open(open);
  if ($$props.close === void 0 && $$bindings.close && close !== void 0)
    $$bindings.close(close);
  $$result.css.add(css);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      { this: modal },
      {
        this: ($$value) => {
          modal = $$value;
          $$settled = false;
        }
      },
      {
        default: () => {
          return `${context && options ? `<div class="flex w-96 flex-col p-6"><h2 class="mb-6 text-center text-2xl" data-svelte-h="svelte-1u0cbq0">Export Chat</h2> <form class="flex flex-col gap-2"><div class="pref-option svelte-x48ymb"><label for="time-range" data-svelte-h="svelte-m8o5kv">Time range</label> <select id="time-range"><option${add_attribute("value", ExportTimeRange.FifteenMinutes, 0)} data-svelte-h="svelte-7uc4lr">15 Mins</option><option${add_attribute("value", ExportTimeRange.OneHour, 0)} data-svelte-h="svelte-1vzbh9x">1 Hour</option><option${add_attribute("value", ExportTimeRange.SixHours, 0)} data-svelte-h="svelte-aplmdi">6 Hours</option><option${add_attribute("value", ExportTimeRange.Today, 0)} data-svelte-h="svelte-mbl4m4">Today</option><option${add_attribute("value", ExportTimeRange.All, 0)} data-svelte-h="svelte-1mf6ack">All</option></select></div> <div class="pref-option svelte-x48ymb"><label for="exclude-system-messages" data-svelte-h="svelte-aicto6">Exclude system messages</label> <input id="exclude-system-messages" type="checkbox"${add_attribute("checked", options.excludeSystemMessages, 1)}></div> <button class="btn mt-4" data-svelte-h="svelte-3vgd1s">Export</button></form></div>` : ``}`;
        }
      }
    )}`;
  } while (!$$settled);
  $$unsubscribe_toastContainerStore();
  return $$rendered;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let currentTab;
  let $currentTabIdx, $$unsubscribe_currentTabIdx;
  let $tabsStore, $$unsubscribe_tabsStore;
  let $preferencesModalStore, $$unsubscribe_preferencesModalStore;
  let $exportModalStore, $$unsubscribe_exportModalStore;
  $$unsubscribe_currentTabIdx = subscribe(currentTabIdx, (value) => $currentTabIdx = value);
  $$unsubscribe_tabsStore = subscribe(tabsStore, (value) => $tabsStore = value);
  $$unsubscribe_preferencesModalStore = subscribe(preferencesModalStore, (value) => $preferencesModalStore = value);
  $$unsubscribe_exportModalStore = subscribe(exportModalStore, (value) => $exportModalStore = value);
  beforeNavigate(async () => {
    closeAllTabs();
  });
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    currentTab = $tabsStore[$currentTabIdx];
    $$rendered = `${validate_component(PreferencesModal, "PreferencesModal").$$render(
      $$result,
      { this: $preferencesModalStore },
      {
        this: ($$value) => {
          $preferencesModalStore = $$value;
          $$settled = false;
        }
      },
      {}
    )} ${validate_component(ExportModal, "ExportModal").$$render(
      $$result,
      { this: $exportModalStore },
      {
        this: ($$value) => {
          $exportModalStore = $$value;
          $$settled = false;
        }
      },
      {}
    )} <div class="flex h-full w-full gap-4 p-6"><div class="flex flex-1 flex-col overflow-hidden rounded ring-2 ring-theme-300"><div class="flex h-7 border-b-2 border-theme-300">${each($tabsStore, (tab, index) => {
      return `${validate_component(TabButton, "TabButton").$$render($$result, { tab, isCurrentTab: currentTab === tab }, {}, {})}`;
    })}</div> ${currentTab instanceof HomeTab ? `${validate_component(HomeTabContent, "HomeTabContent").$$render($$result, {}, {}, {})}` : `${currentTab instanceof ChatTab ? `${validate_component(ChatTabContent, "ChatTabContent").$$render($$result, { chatTab: currentTab }, {}, {})}` : ``}`}</div></div>`;
  } while (!$$settled);
  $$unsubscribe_currentTabIdx();
  $$unsubscribe_tabsStore();
  $$unsubscribe_preferencesModalStore();
  $$unsubscribe_exportModalStore();
  return $$rendered;
});
export {
  Page as default
};
//# sourceMappingURL=_page.svelte.js.map
