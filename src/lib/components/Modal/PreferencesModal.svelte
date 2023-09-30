<script lang="ts">
    import Modal from "../Modal.svelte";
    import { preferences } from "$lib/classes/Preferences";
    import { AutoScrollBehaviour, ChatStyle } from "$lib/enums";

    let modal: Modal;

    export const open = () => modal.open();
    export const close = () => modal.close();

    const chatStyle = preferences.chatStyle;
    const autoScrollBehaviour = preferences.autoScrollBehaviour;
    const darkMode = preferences.darkMode;
    const joinLeaveMessages = preferences.joinLeaveMessages;
</script>

<Modal bind:this={modal}>
    <div class="flex w-96 flex-col p-6">
        <h2 class="mb-6 text-center text-2xl">Preferences</h2>
        <form on:submit|preventDefault class="flex flex-col gap-2">
            <div class="pref-option">
                <label for="chat-style">Chat style</label>
                <select id="chat-style" bind:value={$chatStyle}>
                    <option value={ChatStyle.Cozy}>Cozy</option>
                    <option value={ChatStyle.Compact}>Compact</option>
                </select>
            </div>
            <div class="pref-option">
                <label for="auto-scroll-behaviour">Auto scroll behaviour</label>
                <select id="auto-scroll-behaviour" bind:value={$autoScrollBehaviour}>
                    <option value={AutoScrollBehaviour.Always}>Always</option>
                    <option value={AutoScrollBehaviour.OnlySelf}>Only Self</option>
                    <option value={AutoScrollBehaviour.Never}>Never</option>
                </select>
            </div>
            <div class="pref-option">
                <label for="dark-mode">Dark mode</label>
                <input id="dark-mode" bind:checked={$darkMode} type="checkbox" />
            </div>
            <div class="pref-option">
                <label for="join-leave-messages">Join & leave messages</label>
                <input id="join-leave-messages" bind:checked={$joinLeaveMessages} type="checkbox" />
            </div>
        </form>
    </div>
</Modal>

<style lang="postcss">
    .pref-option {
        @apply flex justify-between;
    }
</style>
