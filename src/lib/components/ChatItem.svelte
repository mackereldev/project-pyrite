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

    let colour = "text-zinc-500";
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
        const pattern = new RegExp(`(.*?)\\b(${usernames.join("|")})\\b`, "g");
        const matches = message.text.split(pattern).filter(Boolean);

        messageContent.innerText = "";
        for (const match of matches) {
            if (usernames.includes(match)) {
                const el = document.createElement("span");
                el.innerText = match;
                el.className = "bg-violet-200 rounded px-0.5 text-violet-400 transition-colors hover:bg-violet-300 hover:text-violet-600 not-italic";
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

<div class="{$chatStyle === ChatStyle.Cozy ? 'text-base' : 'text-sm'} {unreadIndicator ? ' unread-msg-shadow' : ''}{includesMention ? ' bg-amber-100' : ''}">
    <span class="font-mono text-zinc-400">{message.getRelativeTime(relativeStartTime)}</span>
    <span class="font-semibold {colour}">[{author}]</span>
    <span bind:this={messageContent} class="whitespace-pre-wrap {message.type === 'system' ? 'italic text-zinc-400' : 'not-italic'}{message.isError ? ' !text-red-400' : ''}" />
</div>
