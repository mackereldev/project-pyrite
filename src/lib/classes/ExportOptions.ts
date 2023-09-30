import type { ExportTimeRange } from "$lib/enums";

export class ExportOptions {
    timeRange: ExportTimeRange;
    excludeSystemMessages: boolean;

    constructor(timeRange: ExportTimeRange = 0, excludeSystemMessages: boolean = false) {
        this.timeRange = timeRange;
        this.excludeSystemMessages = excludeSystemMessages;
    }
}
