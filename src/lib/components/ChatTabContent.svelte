<script lang="ts">
    import type { ChatTab } from "$lib/classes/ChatTab";
    import { afterUpdate, onDestroy, onMount } from "svelte";
    import ChatItem from "./ChatItem.svelte";
    import { preferencesStore } from "$lib/classes/Stores";
    import { get, type Unsubscriber } from "svelte/store";
    import { AutoScrollBehaviour } from "$lib/enums";
    import { commandRefs } from "$lib/classes/CommandDispatcher";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { Clipboard, ArrowDownTray, Cog6Tooth, ArrowRightOnRectangle } from "@steeze-ui/heroicons";
    import { closeTab } from "$lib/classes/TabHandler";
    import { computePosition, flip, arrow, offset, shift } from "@floating-ui/dom";

    export let chatTab: ChatTab;

    let messageElement: HTMLInputElement;
    let messageValue: string = "";
    let messageHistory: HTMLDivElement;

    let showShadow: boolean;
    let queueAutoScroll = true;

    const messages = chatTab.messages;
    const effectiveUsername = chatTab.effectiveUsername;

    const clients = chatTab.clients;
    let messagesStoreUnsubscribe: Unsubscriber;

    $: commands = Object.keys(commandRefs);

    let copyRoomIDButton: HTMLButtonElement;
    let copyRoomIDButtonTooltip: HTMLDivElement;
    let copyRoomIDButtonTooltipArrow: HTMLDivElement;
    let copyRoomIDButtonTooltipShowTimeout: number = -1;
    let copyRoomIDButtonTooltipSuccess: boolean;

    onMount(() => {
        updateShowShadow();
        messageElement.focus();

        messagesStoreUnsubscribe = messages.subscribe(() => {
            // Automatically scroll after message has been added (afterUpdate)
            if (get(preferencesStore).autoScrollBehaviour === AutoScrollBehaviour.Always) {
                queueAutoScroll = true;
            }
        });
    });

    onDestroy(() => {
        messagesStoreUnsubscribe();
    });

    afterUpdate(() => {
        if (queueAutoScroll) {
            messageHistory.scrollTo(0, messageHistory.scrollHeight);
            queueAutoScroll = false;
        }
    });

    const onSubmitMessage = async () => {
        const room = get(chatTab.roomStore);

        if (room) {
            if (messageValue.startsWith("/")) {
                // Commands
                // Remove consecutive spaces, remove slashes, and trim leading and trailing spaces
                const command = messageValue
                    .replace(/\/|([/ ]+(?= ))/g, "")
                    .trim()
                    .split(" ");
                const commandName = command[0];
                const args = command.slice(1);

                console.debug("COMMAND:", commandName);
                const response = await chatTab.commandDispatcher.executeCommand(commandName, ...args);
                if (response) {
                    chatTab.addMessage(response);
                }
            } else {
                // Chat messages
                const msg = messageValue.replace(/[^ -~]+/g, "").trim();
                if (msg.length > 0) {
                    room.send("client-chat", { msg: messageValue });
                }
            }
        }
        messageValue = "";

        // Automtically mark as read
        chatTab.lastReadMessage = undefined;
    };

    const suggestCommand = (commandName: string) => {
        messageValue += "/" + commandName;
        messageElement.focus();
    };

    const onKeyDown = (event: KeyboardEvent) => {
        if (!event.repeat) {
            if (event.key === "Escape") {
                // Manually mark as read
                chatTab.lastReadMessage = undefined;
            } else if (document.activeElement !== messageElement) {
                if (event.key.match(/^[\x20-\x7F]$/g)) {
                    // Automatically focus the message box
                    messageElement.focus();
                } else if (["Delete", "Backspace"].includes(event.key)) {
                    // Automatically focus the message box without affecting the input value
                    messageElement.focus();
                    event.preventDefault();
                }
            }
        }
    };

    const updateShowShadow = () => {
        showShadow = messageHistory.scrollHeight - messageHistory.scrollTop > messageHistory.clientHeight;
    };

    const copyRoomID = () => {
        // Copy code to clipboard
        navigator.clipboard.writeText(get(chatTab.name)).then(
            () => {
                copyRoomIDButtonTooltipSuccess = true;
                showCopyRoomIdTooltip();
            },
            () => {
                copyRoomIDButtonTooltipSuccess = false;
                showCopyRoomIdTooltip();
            },
        );
    };

    const showCopyRoomIdTooltip = () => {
        // Show tooltip
        copyRoomIDButtonTooltip.style.opacity = "1";

        // Clear existing timeout
        if (copyRoomIDButtonTooltipShowTimeout !== -1) {
            clearTimeout(copyRoomIDButtonTooltipShowTimeout);
        }

        // Set tooltip to disappear after 1s
        copyRoomIDButtonTooltipShowTimeout = setTimeout(() => {
            copyRoomIDButtonTooltip.style.opacity = "0";
            copyRoomIDButtonTooltipShowTimeout = -1;
        }, 1000);

        // Position tooltip
        computePosition(copyRoomIDButton, copyRoomIDButtonTooltip, {
            placement: "top",
            middleware: [offset(10), flip({ padding: 5 }), shift({ padding: 5 }), arrow({ element: copyRoomIDButtonTooltipArrow })],
        }).then(({ x, y, placement, middlewareData }) => {
            Object.assign(copyRoomIDButtonTooltip.style, {
                left: `${x}px`,
                top: `${y}px`,
            });

            if (middlewareData.arrow) {
                const { x: arrowX, y: arrowY } = middlewareData.arrow;

                const staticSide = {
                    top: "bottom",
                    right: "left",
                    bottom: "top",
                    left: "right",
                }[placement.split("-")[0]] as string;

                Object.assign(copyRoomIDButtonTooltipArrow.style, {
                    left: arrowX !== null && arrowX !== undefined ? `${arrowX}px` : "",
                    top: arrowY !== null && arrowY !== undefined ? `${arrowY}px` : "",
                    right: "",
                    bottom: "",
                    [staticSide]: "-4px",
                });
            }
        });
    };

    const exportChatHistory = () => {
        console.log("export chat history");
    };

    const openPreferencesModal = () => {
        console.log("open preferences modal");
    };

    const leaveRoom = () => {
        console.log("leave room");
        closeTab(chatTab);
    };
</script>

<svelte:window on:resize={updateShowShadow} on:keydown={onKeyDown} />

<div class="flex w-full flex-grow flex-row">
    <div class="flex flex-1 basis-48 flex-col overflow-clip border-r-2 border-zinc-300">
        <div bind:this={messageHistory} on:scroll={updateShowShadow} class="flex flex-grow basis-0 flex-col gap-1 overflow-y-scroll break-words px-3 pt-3 transition-all">
            {#each $messages as message, i (message)}
                <ChatItem {chatTab} {message} unreadIndicator={i !== $messages.length - 1 && chatTab.lastReadMessage === message} relativeStartTime={get(chatTab.roomStore).state.serverStartTime} />
            {/each}
        </div>
        <form on:submit|preventDefault={onSubmitMessage} class={`p-4 transition-shadow duration-150 ${showShadow && "chat-entry-shadow"}`}>
            <!-- svelte-ignore a11y-autofocus -->
            <input type="text" autofocus bind:this={messageElement} bind:value={messageValue} class="h-8 w-full rounded px-2 text-sm ring-2 ring-zinc-300" />
        </form>
    </div>
    <div class="flex basis-80 flex-col">
        <div class="flex h-8 border-b-2 border-zinc-300">
            <button bind:this={copyRoomIDButton} on:click={copyRoomID} title="Copy Room ID" class="group flex-grow py-1 transition-colors hover:bg-zinc-200">
                <Icon src={Clipboard} class="stroke-zinc-400 stroke-2 transition-colors group-hover:stroke-zinc-500" />
            </button>
            <div bind:this={copyRoomIDButtonTooltip} class="pointer-events-none absolute rounded-lg px-2 py-1 opacity-0 transition-opacity duration-150 {copyRoomIDButtonTooltipSuccess ? 'bg-green-300 text-green-600' : 'bg-zinc-300 text-zinc-500'}">
                {copyRoomIDButtonTooltipSuccess ? "Copied!" : "Unable to copy"}
                <div bind:this={copyRoomIDButtonTooltipArrow} class="absolute h-2 w-2 rotate-45 {copyRoomIDButtonTooltipSuccess ? 'bg-green-300' : 'bg-zinc-300'}" />
            </div>
            <button on:click={exportChatHistory} title="Export Chat History" class="group flex-grow py-1 transition-colors hover:bg-zinc-200">
                <Icon on:click={exportChatHistory} src={ArrowDownTray} class="stroke-zinc-400 stroke-2 transition-colors group-hover:stroke-zinc-500" />
            </button>
            <button on:click={openPreferencesModal} title="Preferences" class="group flex-grow py-1 transition-colors hover:bg-zinc-200">
                <Icon on:click={openPreferencesModal} src={Cog6Tooth} class="stroke-zinc-400 stroke-2 transition-colors group-hover:stroke-zinc-500" />
            </button>
            <button on:click={leaveRoom} title="Leave Room" class="group flex-grow py-1 transition-colors hover:bg-zinc-200">
                <Icon on:click={leaveRoom} src={ArrowRightOnRectangle} class="stroke-zinc-400 stroke-2 transition-colors group-hover:stroke-zinc-500" />
            </button>
        </div>
        <div class="flex flex-1 flex-col overflow-clip border-b border-zinc-300 p-5">
            <span class="border-b-2 border-zinc-300 pb-2 text-2xl">Members</span>
            <div class="flex flex-col overflow-y-scroll">
                {#each $clients as client}
                    <div class="flex p-4">
                        {#if client.isLeader}
                            <span class="mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-6 w-6 fill-amber-400 stroke-amber-400 stroke-2">
                                    <path d="M4 19H20M11.2929 5.70711L8.70711 8.2929C8.31658 8.68342 7.68342 8.68342 7.29289 8.2929L5.70711 6.70711C5.07714 6.07714 4 6.52331 4 7.41422V15C4 15.5523 4.44772 16 5 16H19C19.5523 16 20 15.5523 20 15V7.41421C20 6.52331 18.9229 6.07714 18.2929 6.70711L16.7071 8.2929C16.3166 8.68342 15.6834 8.68342 15.2929 8.2929L12.7071 5.70711C12.3166 5.31658 11.6834 5.31658 11.2929 5.70711Z" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </span>
                        {:else}
                            <span class="mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-6 w-6 fill-none stroke-zinc-400 stroke-2">
                                    <path d="M17.5 21.0001H6.5C5.11929 21.0001 4 19.8808 4 18.5001C4 14.4194 10 14.5001 12 14.5001C14 14.5001 20 14.4194 20 18.5001C20 19.8808 18.8807 21.0001 17.5 21.0001Z" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </span>
                        {/if}
                        <span class="font-bold{client.clientId === $effectiveUsername ? ' text-violet-500' : ''}">{client.clientId}</span>
                    </div>
                {/each}
            </div>
        </div>
        <div class="flex flex-1 flex-col overflow-clip border-t border-zinc-300 p-5">
            <span class="border-b-2 border-zinc-300 pb-2 text-2xl">Commands</span>
            <div class="flex flex-col overflow-y-scroll">
                {#each commands as command}
                    <button on:click={() => suggestCommand(command)} class="mt-2 flex">
                        <div class="w-full rounded-lg px-3 py-2 text-start ring-2 ring-inset ring-zinc-200">{command}</div>
                    </button>
                {/each}
            </div>
        </div>
    </div>
</div>
