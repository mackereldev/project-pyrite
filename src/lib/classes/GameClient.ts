import { get } from "svelte/store";
import { roomStore } from "./Stores";
import type { Entity } from "../../../server/src/schema/quest/Entity";

export const generateUpcomingTurns = (count: number) => {
    const questState = get(roomStore).state.questState;

    if (!["battle"].includes(questState.room?.type)) {
        throw new Error("Must be in a battle room. (WIP)");
    }

    const turnIndex = questState.turnCycle.indexOf(questState.currentTurn);

    if (turnIndex !== -1) {
        const arr: Entity[] = [];
        for (let i = turnIndex; i < count + turnIndex; i++) {
            arr.push(questState.turnCycle[i % questState.turnCycle.length]);
        }
        return arr;
    } else {
        throw new Error("Entity does not exist in the turn cycle");
    }
};
