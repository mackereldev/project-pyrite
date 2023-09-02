export type SectionBody = { prependIndices?: boolean, items: string[] };
export type Section = { [heading: string]: Section | SectionBody | undefined }

const isRecursiveSection = (obj: any): obj is Section => {
    const body = (obj as SectionBody);
    return body !== undefined && body.items === undefined;
};

export const constructSection = (rootSection: Section, showIndices: boolean = false) => {
    const recurSection = (section: Section, depth: number = 1): string => {
        let tree = "";
        
        const headings = Object.keys(section);
        for (let i = 0; i < headings.length; i++) {
            const heading = headings[i];
    
            if (isRecursiveSection(section[heading])) {
                const subSection = recurSection(section[heading] as Section, depth + 1);
                if (subSection) {
                    tree += "\n" + "  ".repeat(depth) + heading;
                    tree += recurSection(section[heading] as Section, depth + 1);
                }
            } else if (section[heading]) {
                const body = (section[heading] as SectionBody);
                if (body.items.length > 0) {
                    tree += "\n" + "  ".repeat(depth) + heading;
                    tree += (body.items as string[]).map((item, idx) => "\n" + "  ".repeat(depth + 1) + (showIndices && body.prependIndices ? `[${idx + 1}] ` : "") + item).join("");
                }
            }
        }
    
        return tree;
    };

    return recurSection(rootSection);
};
