<script lang="ts">
    import type ChatMessage from "$lib/classes/ChatMessage";
    import { ChatMessageType } from "$lib/enums";

    export let message: ChatMessage;

    let colour = "text-zinc-500";
    let author = "invalid";
    if (message.type == ChatMessageType.Player) {
        colour = "text-violet-500";
        author = message.author || "invalid";
    } else if (message.type == ChatMessageType.Game) {
        colour = "text-sky-500";
        author = "GAME";
    } else if (message.type == ChatMessageType.System) {
        colour = "text-green-500";
        author = "SYSTEM";
    }
</script>

<div class="font-mono">
    <span class="text-zinc-400">{message.formattedTime}</span>
    <span class={colour}>[{author}]</span>
    <span>{message.text}</span>
</div>
