/** When a chat section should automatically scroll. */
export const enum AutoScrollBehaviour {
    /** Automatically scroll when any message is sent or received. */
    Always,
    /** Automatically scroll only when the client sends a message. */
    OnlySelf,
    /** Never automatically scroll. */
    Never,
}

/** The type of sender of a chat message (decides appearance). */
export const enum ChatMessageType {
    /** A message sent by a client. */
    Player,
    /** A message representing an action in the game world. */
    Game,
    /** A message sent by the server. */
    System,
}
