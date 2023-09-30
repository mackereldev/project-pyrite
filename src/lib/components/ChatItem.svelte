<script lang="ts">
    import type { ChatMessage } from "$lib/classes/ChatMessage";
    import { onMount } from "svelte";
    import type { ChatTab } from "$lib/classes/ChatTab";
    import { get } from "svelte/store";
    import { preferences } from "$lib/classes/Preferences";
    import { ChatStyle } from "$lib/enums";

    export let chatTab: ChatTab;
    export let message: ChatMessage;
    export let relativeStartTime: number;
    export let unreadIndicator: boolean = false;

    let messageContent: HTMLSpanElement;

    let colour = "text-theme-500";
    let author = "invalid";
    if (message.type === "user") {
        colour = "text-violet-500";
        author = message.author || "invalid";
    } else if (message.type === "system") {
        colour = "text-sky-500";
        author = "SYSTEM";
    }

    let includesMention = false;

    onMount(() => {
        // https://stackoverflow.com/a/65149088
        const usernames = get(chatTab.clients).map((client) => client.clientId);
        const usernameMatchQueury = usernames.map((u) => u.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")).join("|"); // Escapes special characters and joins each username by a '|'
        const pattern = new RegExp(`(.*?)(${usernameMatchQueury})`, "g");
        const matches = message.text.split(pattern).filter(Boolean);

        messageContent.innerText = "";
        for (const match of matches) {
            if (usernames.includes(match)) {
                const el = document.createElement("span");
                el.innerText = match;
                el.className = "bg-violet-200 dark:bg-violet-400 dark:hover:bg-violet-500 rounded px-0.5 text-violet-400 dark:text-violet-600 transition-colors hover:bg-violet-300 hover:text-violet-600 dark:hover:text-violet-800 not-italic";
                messageContent.appendChild(el);

                // Highlight the entire message if the user was mentioned
                if (match === get(chatTab.effectiveUsername)) {
                    includesMention = true;
                }
            } else {
                messageContent.appendChild(document.createTextNode(match));
            }
        }
    });

    const chatStyle = preferences.chatStyle;
</script>

<div class="{$chatStyle === ChatStyle.Cozy ? 'text-base' : 'text-sm'} {unreadIndicator ? ' unread-msg-shadow' : ''}{includesMention ? ' bg-amber-100 dark:bg-amber-400/20' : ''}">
    <span class="font-mono text-theme-400">{message.getRelativeTime(relativeStartTime)}</span>
    <span class="font-semibold {colour}">[{author}]</span>
    <span bind:this={messageContent} class="whitespace-pre-wrap {message.type === 'system' ? 'italic text-theme-400' : 'not-italic'}{message.isError ? ' !text-red-400' : ''}" />
</div>
