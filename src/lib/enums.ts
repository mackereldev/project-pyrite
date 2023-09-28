/** The condition for when the chat should automatically scroll. */
export const enum AutoScrollBehaviour {
    /** Automatically scroll when any message is sent or received. */
    Always,
    /** Automatically scroll only when the client sends a message. */
    OnlySelf,
    /** Never automatically scroll. */
    Never,
}

/** The style of message chats. */
export const enum ChatStyle {
    /** Looser leading, greater readability. */
    Cozy,
    /** Tighter leading, less padding. */
    Compact,
}
