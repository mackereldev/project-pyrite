/** When a chat section should automatically scroll. */
export const enum AutoScrollBehaviour {
    /** Automatically scroll when any message is sent or received. */
    Always,
    /** Automatically scroll only when the client sends a message. */
    OnlySelf,
    /** Never automatically scroll. */
    Never,
}
