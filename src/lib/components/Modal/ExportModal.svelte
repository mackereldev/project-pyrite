<script lang="ts">
    import type { ChatTab } from "$lib/classes/ChatTab";
    import { ExportOptions } from "$lib/classes/ExportOptions";
    import { ExportTimeRange } from "$lib/enums";
    import { get } from "svelte/store";
    import Modal from "../Modal.svelte";
    import dayjs, { type Dayjs } from "dayjs";
    import type { ChatMessage } from "$lib/classes/ChatMessage";
    import { toastContainerStore } from "$lib/classes/Stores";
    import ToastData from "$lib/classes/ToastData";
    import { mkConfig, generateCsv, download } from "export-to-csv";

    let modal: Modal;

    let context: ChatTab;
    $: context;

    let options: ExportOptions;

    export const open = (chatTab: ChatTab) => {
        context = chatTab;
        options = new ExportOptions();
        modal.open();
    };
    export const close = () => modal.close();

    const processExport = () => {
        const getFilteredMessages = (ordered: ChatMessage[]) => {
            // Filter out system messages
            if (options.excludeSystemMessages) {
                return ordered.filter((msg) => msg.type !== "system");
            }
            return ordered;
        };

        const getFilteredMessagesInRange = (ordered: ChatMessage[], date: Dayjs) => {
            /*
            This iterates backwards from the end of the array until it finds a message
            that was sent before the 'date' specified, and returns its index. It adds 1 to
            the result to get the last message that was sent *after* the 'date' specified.
            */
            const rangeExtentIndex = ordered.findLastIndex((msg) => dayjs(msg.time).isBefore(date)) + 1;

            // This gets all messages from the 'rangeExtentIndex' to the latest message.
            const messagesInRange = ordered.slice(rangeExtentIndex);

            return getFilteredMessages(messagesInRange);
        };

        const orderedMessages = get(context.messages);
        let validatedMessages: ChatMessage[];

        // Set validatedMessages based on the time range specified by the user
        switch (options.timeRange) {
            case ExportTimeRange.FifteenMinutes:
                validatedMessages = getFilteredMessagesInRange(orderedMessages, dayjs().subtract(15, "minutes"));
                break;
            case ExportTimeRange.OneHour:
                validatedMessages = getFilteredMessagesInRange(orderedMessages, dayjs().subtract(1, "hour"));
                break;
            case ExportTimeRange.SixHours:
                validatedMessages = getFilteredMessagesInRange(orderedMessages, dayjs().subtract(6, "hour"));
                break;
            case ExportTimeRange.Today:
                validatedMessages = getFilteredMessagesInRange(orderedMessages, dayjs().startOf("day"));
                break;
            default:
                validatedMessages = getFilteredMessages(orderedMessages);
                break;
        }

        // Only processes the export if there are any messages that match the user's options
        if (validatedMessages.length > 0) {
            // prettier-ignore
            // Construct the csv content (keys are headers)
            const csvBody = validatedMessages.map((msg) => {return {
                time: dayjs(msg.time).format("dddd YYYY/MM/DD h:mm:ss.SSS A"),
                author: msg.type === "system" ? "*SYSTEM*" : msg.author!,
                message: msg.text.replace(/\t/g, " "),
            };});

            // prettier-ignore
            // Construct the file name
            const fileName = [
                get(context.name), // Room name
                "export", // File descriptor / role
                dayjs().format("YYYY-MM-DD_HH-mm-ss"), // Date & time of export
                `[${validatedMessages.length} messages]`, // Message count
            ].join(" ");

            // Generate and download the csv file
            const csvConfig = mkConfig({ useKeysAsHeaders: true, fieldSeparator: "\t", filename: fileName });
            const csv = generateCsv(csvConfig)(csvBody);
            download(csvConfig)(csv);
        } else {
            $toastContainerStore.addToasts(new ToastData("warning", "Export Failed", "No messages match the options"));
        }
    };
</script>

<Modal bind:this={modal}>
    {#if context && options}
        <div class="flex w-96 flex-col p-6">
            <h2 class="mb-6 text-center text-2xl">Export Chat</h2>
            <form on:submit|preventDefault class="flex flex-col gap-2">
                <div class="pref-option">
                    <label for="time-range">Time range</label>
                    <select id="time-range" bind:value={options.timeRange}>
                        <option value={ExportTimeRange.FifteenMinutes}>15 Mins</option>
                        <option value={ExportTimeRange.OneHour}>1 Hour</option>
                        <option value={ExportTimeRange.SixHours}>6 Hours</option>
                        <option value={ExportTimeRange.Today}>Today</option>
                        <option value={ExportTimeRange.All}>All</option>
                    </select>
                </div>
                <div class="pref-option">
                    <label for="exclude-system-messages">Exclude system messages</label>
                    <input id="exclude-system-messages" bind:checked={options.excludeSystemMessages} type="checkbox" />
                </div>
                <button on:click={processExport} class="btn mt-4">Export</button>
            </form>
        </div>
    {/if}
</Modal>

<style lang="postcss">
    .pref-option {
        @apply flex justify-between;
    }
</style>
