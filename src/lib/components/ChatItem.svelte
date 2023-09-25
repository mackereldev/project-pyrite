<script lang="ts">
    import type { ChatMessage } from "$lib/classes/ChatMessage";

    export let message: ChatMessage;
    export let relativeStartTime: number;
    export let unreadIndicator: boolean = false;

    let colour = "text-zinc-500";
    let author = "invalid";
    if (message.type === "user") {
        colour = "text-violet-500";
        author = message.author || "invalid";
    } else if (message.type === "system") {
        colour = "text-sky-500";
        author = "SYSTEM";
    }
</script>

<div class="font-mono{unreadIndicator ? " unread-msg-shadow" : ""}">
    <span class="text-zinc-400">{message.getRelativeTime(relativeStartTime)}</span>
    <span class="font-bold {colour}">[{author}]</span>
    <span class="whitespace-pre-wrap{message.isError ? " text-red-400" : ""}">{message.text}</span>
</div>
