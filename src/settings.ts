import { App, PluginSettingTab, Setting } from "obsidian";
import SimpleChecklistPlugin from "./main";

export interface SimpleChecklistSettings {
	// Add settings as needed
}

export const DEFAULT_SETTINGS: SimpleChecklistSettings = {
	// Add default settings as needed
};

export class SimpleChecklistSettingTab extends PluginSettingTab {
	plugin: SimpleChecklistPlugin;

	constructor(app: App, plugin: SimpleChecklistPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Simple Checklist Settings" });

		// Add settings here as needed
	}
}
