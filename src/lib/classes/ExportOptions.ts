import type { ExportTimeRange } from "$lib/enums";

/** Options for exporting a ChatTab into a csv file (used by ExportModal) */
export class ExportOptions {
    timeRange: ExportTimeRange;
    excludeSystemMessages: boolean;

    constructor(timeRange: ExportTimeRange = 0, excludeSystemMessages: boolean = false) {
        this.timeRange = timeRange;
        this.excludeSystemMessages = excludeSystemMessages;
    }
}
