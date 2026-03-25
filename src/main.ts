import { Plugin } from "obsidian";
import { EditorState, Transaction, ChangeSpec } from "@codemirror/state";

const autoHeadingAliasFilter = EditorState.transactionFilter.of(
    (tr: Transaction) => {
        // return early if no changes
        if (!tr.docChanged) return tr;

        let hasMatch = false;
        const newChanges: ChangeSpec[] = [];

        // iterate through all changes in the transaction
        tr.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
            const text = inserted.toString();

            // match format [[filename#heading]]
            const match = text.match(/^\[\[([^|\]]+)#([^|\]]+)\]\]$/);

            if (match) {
                hasMatch = true;
                const filename = match[1];
                const heading = match[2];
                // replace with [[filename#heading|heading]]
                const replacement = `[[${filename}#${heading}|${heading}]]`;
                newChanges.push({
                    from: fromA,
                    to: toA,
                    insert: replacement,
                });
            } else {
                newChanges.push({
                    from: fromA,
                    to: toA,
                    insert: inserted,
                });
            }
        });

        if (hasMatch) return { changes: newChanges };
        return tr;
    },
);

export default class AutoHeadingLinkAliasPlugin extends Plugin {
    async onload() {
        this.registerEditorExtension(autoHeadingAliasFilter);
    }
}
