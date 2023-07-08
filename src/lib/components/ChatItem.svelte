<script lang="ts">
    import type ChatMessage from "$lib/classes/ChatMessage";
    import { ChatMessageType } from "$lib/enums";

    export let message: ChatMessage;

    let colour = "text-zinc-500";
    if (message.type == ChatMessageType.Player) {
        colour = "text-violet-500";
    } else if (message.type == ChatMessageType.Game) {
        colour = "text-sky-500";
    } else if (message.type == ChatMessageType.System) {
        colour = "text-green-500";
    }
</script>

<div class="font-mono">
    <span class="text-zinc-400">{message.formattedTime}</span>
    <span class={colour}>[{message.author}]</span>
    <span>{message.text}</span>
</div>
