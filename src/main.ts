import { Plugin } from "obsidian";
import { ChecklistView, CHECKLIST_VIEW_TYPE } from "./view";
import { ChecklistItem } from "./types";

interface PluginData {
	items: ChecklistItem[];
}

export default class SimpleChecklistPlugin extends Plugin {
	checklistView: ChecklistView | null = null;

	async onload(): Promise<void> {
		// Register the view
		this.registerView(CHECKLIST_VIEW_TYPE, (leaf) => {
			this.checklistView = new ChecklistView(leaf, this);
			return this.checklistView;
		});

		// Add command to open the checklist view
		this.addCommand({
			id: "open-checklist",
			name: "Open checklist",
			callback: () => this.openChecklistView(),
		});

		// Set the checklist view as active if it doesn't exist
		this.registerEvent(this.app.workspace.on("layout-change", () => {
			const leaves = this.app.workspace.getLeavesOfType(CHECKLIST_VIEW_TYPE);
			if (leaves.length === 0) {
				// Optionally create a default view on first load
				// this.openChecklistView();
			}
		}));
	}

	async onunload(): Promise<void> {
		// Save data before unloading
		if (this.checklistView && this.checklistView.items.length > 0) {
			await this.savePluginData(this.checklistView.items);
		}
		// Clean up
		this.app.workspace.detachLeavesOfType(CHECKLIST_VIEW_TYPE);
	}

	private async openChecklistView(): Promise<void> {
		const leaf = this.app.workspace.getLeaf(false);
		await leaf?.setViewState({
			type: CHECKLIST_VIEW_TYPE,
			active: true,
		});
		this.app.workspace.revealLeaf(leaf!);
	}

	async savePluginData(items: ChecklistItem[]): Promise<void> {
		const data: PluginData = { items };
		await this.saveData(data);
	}

	async loadPluginData(): Promise<ChecklistItem[]> {
		const data = (await this.loadData()) as PluginData | null;
		return data?.items || [];
	}
}
