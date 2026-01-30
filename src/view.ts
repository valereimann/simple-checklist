import { ItemView, ViewStateResult, WorkspaceLeaf } from "obsidian";
import { ChecklistItem } from "./types";
import type SimpleChecklistPlugin from "./main";

export const CHECKLIST_VIEW_TYPE = "simple-checklist-view";

export class ChecklistView extends ItemView {
	items: ChecklistItem[] = [];
	private inputElement: HTMLInputElement;
	private urgentListElement: HTMLUListElement;
	private generalListElement: HTMLUListElement;
	private draggedItem: ChecklistItem | null = null;
	private draggedElement: HTMLElement | null = null;
	private editingId: string | null = null;
	private plugin: SimpleChecklistPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: SimpleChecklistPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return CHECKLIST_VIEW_TYPE;
	}

	getDisplayText(): string {
		return "Simple Checklist";
	}

	getIcon(): string {
		return "list-todo";
	}

	async onOpen(): Promise<void> {
		const container = this.containerEl.children[1] as HTMLElement;
		container.empty();

		// Create main container
		const mainContainer = container.createDiv("checklist-container");

		// Create input section
		const inputSection = mainContainer.createDiv("checklist-input-section");
		this.inputElement = inputSection.createEl("input", {
			type: "text",
			placeholder: "Add a new item... (use -- prefix for general) (Press Enter)",
			cls: "checklist-input",
		});

		// Create next-steps list section
		const nextStepsSection = mainContainer.createDiv("checklist-section");
		nextStepsSection.createEl("h3", {
			text: "Next Steps",
			cls: "checklist-section-title",
		});
		this.urgentListElement = nextStepsSection.createEl("ul", {
			cls: "checklist-list",
			attr: { "data-category": "next-steps" },
		});
		// Add drop handlers to the list itself
		this.urgentListElement.addEventListener("dragover", (e: DragEvent) => this.handleDragOver(e));
		this.urgentListElement.addEventListener("drop", (e: DragEvent) => this.handleDropOnList(e, "next-steps"));
		this.urgentListElement.addEventListener("dragenter", (e: DragEvent) => this.handleDragEnterList(e));
		this.urgentListElement.addEventListener("dragleave", (e: DragEvent) => this.handleDragLeaveList(e));

		// Create general list section
		const generalSection = mainContainer.createDiv("checklist-section");
		generalSection.createEl("h3", {
			text: "General",
			cls: "checklist-section-title",
		});
		this.generalListElement = generalSection.createEl("ul", {
			cls: "checklist-list",
			attr: { "data-category": "general" },
		});
		// Add drop handlers to the list itself
		this.generalListElement.addEventListener("dragover", (e: DragEvent) => this.handleDragOver(e));
		this.generalListElement.addEventListener("drop", (e: DragEvent) => this.handleDropOnList(e, "general"));
		this.generalListElement.addEventListener("dragenter", (e: DragEvent) => this.handleDragEnterList(e));
		this.generalListElement.addEventListener("dragleave", (e: DragEvent) => this.handleDragLeaveList(e));

		// Event listeners
		this.inputElement.addEventListener("keypress", (e) => this.handleInputKeypress(e));

		// Load saved data
		await this.loadData();
		this.render();
	}

	async onClose(): Promise<void> {
		await this.saveData();
	}

	async saveDataBeforeUnload(): Promise<void> {
		await this.saveData();
	}

	private async handleInputKeypress(e: KeyboardEvent): Promise<void> {
		if (e.key === "Enter" && this.inputElement.value.trim()) {
			this.addItem(this.inputElement.value.trim());
			this.inputElement.value = "";
			this.render();
			await this.saveData(); // Wait for save to complete
		}
	}

	private addItem(text: string): void {
		let category: "next-steps" | "general" = "next-steps";
		let itemText = text;

		// Check for -- prefix for general category
		if (text.startsWith("--")) {
			category = "general";
			itemText = text.substring(2).trim();
		}

		// Calculate position for next-steps category
		let position: number | undefined;
		if (category === "next-steps") {
			const nextStepsItems = this.items.filter((i) => i.category === "next-steps");
			position = nextStepsItems.length + 1;
		}

		const newItem: ChecklistItem = {
			id: Date.now().toString(),
			text: itemText,
			completed: false,
			category,
			position,
		};
		this.items.push(newItem);
	}

	private toggleItem(id: string): void {
		const item = this.items.find((i) => i.id === id);
		if (item) {
			item.completed = !item.completed;
			this.render();
			void this.saveData();
		}
	}

	private updateItem(id: string, newText: string): void {
		const item = this.items.find((i) => i.id === id);
		if (item) {
			item.text = newText;
		}
	}

	private deleteItem(id: string): void {
		this.items = this.items.filter((i) => i.id !== id);
		this.render();
		void this.saveData();
	}

	private render(): void {
		this.urgentListElement.empty();
		this.generalListElement.empty();

		// Recalculate positions for next-steps items
		let nextStepsPosition = 1;
		this.items.forEach((item) => {
			if (item.category === "next-steps") {
				item.position = nextStepsPosition++;
			}
		});

		this.items.forEach((item) => {
			const listElement =
				item.category === "next-steps" ? this.urgentListElement : this.generalListElement;

			const li = listElement.createEl("li", {
				cls: "checklist-item",
				attr: { "data-item-id": item.id },
			});

			// Position number for next-steps
			if (item.category === "next-steps" && item.position) {
				li.createEl("span", {
					text: `${item.position}.`,
					cls: "checklist-position",
				});
			}

			// Drag handle (3 stacked dots) - only this is draggable
			const dragHandle = li.createDiv("checklist-drag-handle");
			dragHandle.draggable = true;
			dragHandle.createEl("span", { text: "⋮", cls: "checklist-drag-icon" });

			// Checkbox
			const checkbox = li.createEl("input", {
				type: "checkbox",
				cls: "checklist-checkbox",
			});
			checkbox.checked = item.completed;
			checkbox.addEventListener("change", () => this.toggleItem(item.id));

			// Text or edit input
			if (this.editingId === item.id) {
				// Edit mode
				const editInput = li.createEl("input", {
					type: "text",
					cls: "checklist-edit-input",
					value: item.text,
				});
				editInput.focus();
				editInput.select();

				const handleEditEnd = (save: boolean) => {
					if (save && editInput.value.trim()) {
						this.updateItem(item.id, editInput.value.trim());
					}
					this.editingId = null;
					this.render();
					void this.saveData();
				};

				editInput.addEventListener("blur", () => handleEditEnd(true));
				editInput.addEventListener("keypress", (e: KeyboardEvent) => {
					if (e.key === "Enter") {
						handleEditEnd(true);
					}
				});
				editInput.addEventListener("keydown", (e: KeyboardEvent) => {
					if (e.key === "Escape") {
						handleEditEnd(false);
					}
				});
			} else {
				// View mode
				const label = li.createEl("label", {
					cls: "checklist-label",
					text: item.text,
				});
				label.addEventListener("click", () => {
					this.editingId = item.id;
					this.render();
				});
			}

			// Delete button
			const deleteBtn = li.createEl("button", {
				cls: "checklist-btn checklist-btn-delete",
				attr: { title: "Delete item" },
			});
			deleteBtn.innerHTML = '🗑️';
			deleteBtn.addEventListener("click", () => this.deleteItem(item.id));

			// Drag events on the handle only
			dragHandle.addEventListener("dragstart", (e: DragEvent) => this.handleDragStart(e, item.id));
			dragHandle.addEventListener("dragend", (e: DragEvent) => this.handleDragEnd(e));

			// Drop events on the list item
			li.addEventListener("dragover", (e: DragEvent) => this.handleDragOver(e));
			li.addEventListener("drop", (e: DragEvent) => this.handleDrop(e, item.id));
			li.addEventListener("dragenter", (e: DragEvent) => this.handleDragEnter(e));
			li.addEventListener("dragleave", (e: DragEvent) => this.handleDragLeave(e));

			// Add completed class if needed
			if (item.completed) {
				li.classList.add("completed");
			}
		});
	}

	private handleDragStart(e: DragEvent, itemId: string): void {
		this.draggedItem = this.items.find((i) => i.id === itemId) || null;
		this.draggedElement = e.target as HTMLElement;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = "move";
			e.dataTransfer.setData("text/html", this.draggedElement.innerHTML);
		}
	}

	private handleDragOver(e: DragEvent): void {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = "move";
		}

		// Detect which item we're over and show visual feedback
		const target = (e.target as HTMLElement).closest(".checklist-item");
		if (target && target !== this.draggedElement) {
			// Remove drag-over from all items
			const allItems = Array.from(
				this.urgentListElement.querySelectorAll(".checklist-item")
			).concat(Array.from(this.generalListElement.querySelectorAll(".checklist-item")));
			allItems.forEach((item) => {
				if (item !== target) {
					item.classList.remove("drag-over");
				}
			});

			// Add drag-over to current target
			target.classList.add("drag-over");
		}
	}

	private handleDragEnter(e: DragEvent): void {
		const target = (e.target as HTMLElement).closest(".checklist-item");
		if (target && target !== this.draggedElement) {
			target.classList.add("drag-over");
		}
	}

	private handleDragLeave(e: DragEvent): void {
		const target = (e.target as HTMLElement).closest(".checklist-item");
		if (target) {
			target.classList.remove("drag-over");
		}
	}

	private handleDrop(e: DragEvent, targetItemId: string): void {
		e.preventDefault();
		e.stopPropagation();

		if (!this.draggedItem) return;

		const draggedIndex = this.items.findIndex((i) => i.id === this.draggedItem!.id);
		const targetIndex = this.items.findIndex((i) => i.id === targetItemId);

		if (draggedIndex === -1 || targetIndex === -1) return;

		const draggedItemData = this.items[draggedIndex]!;
		const targetItemData = this.items[targetIndex]!;

		// If dragging to a different category, change the category
		if (draggedItemData.category !== targetItemData.category) {
			draggedItemData.category = targetItemData.category;
			// Remove position number if moving to general
			if (draggedItemData.category === "general") {
				draggedItemData.position = undefined;
			}
		}

		// If same item, ignore
		if (draggedIndex === targetIndex) {
			this.render();
			return;
		}

		// Get the target element to determine drop position (above or below)
		const targetElement = document.querySelector(`[data-item-id="${targetItemId}"]`) as HTMLElement;
		if (!targetElement) return;

		const rect = targetElement.getBoundingClientRect();
		const midpoint = rect.top + rect.height / 2;
		const isDropBelow = e.clientY > midpoint;

		// Remove from old position
		this.items.splice(draggedIndex, 1);

		// Calculate new insert position
		let newTargetIndex = this.items.findIndex((i) => i.id === targetItemId);
		if (newTargetIndex === -1) return;

		// If dropping below, insert after the target
		if (isDropBelow) {
			newTargetIndex = newTargetIndex + 1;
		}

		// Insert at the new position
		this.items.splice(newTargetIndex, 0, draggedItemData);

		this.render();
		void this.saveData();
	}

	private handleDragEnd(e: DragEvent): void {
		this.draggedItem = null;
		this.draggedElement = null;

		// Remove all drag-over classes
		const urgentItems = Array.from(this.urgentListElement.querySelectorAll(".checklist-item"));
		const generalItems = Array.from(this.generalListElement.querySelectorAll(".checklist-item"));
		[...urgentItems, ...generalItems].forEach((item) => item.classList.remove("drag-over"));
		
		// Remove drag-over class from lists
		this.urgentListElement.classList.remove("drag-over");
		this.generalListElement.classList.remove("drag-over");
	}

	private handleDragEnterList(e: DragEvent): void {
		const target = (e.target as HTMLElement).closest(".checklist-list");
		if (target) {
			target.classList.add("drag-over");
		}
	}

	private handleDragLeaveList(e: DragEvent): void {
		const target = (e.target as HTMLElement).closest(".checklist-list");
		if (target) {
			target.classList.remove("drag-over");
		}
	}

	private handleDropOnList(e: DragEvent, targetCategory: "next-steps" | "general"): void {
		e.preventDefault();
		e.stopPropagation();

		if (!this.draggedItem) return;

		const draggedIndex = this.items.findIndex((i) => i.id === this.draggedItem!.id);
		if (draggedIndex === -1) return;

		const draggedItemData = this.items[draggedIndex]!;

		// If dragging to a different category, change the category
		if (draggedItemData.category !== targetCategory) {
			draggedItemData.category = targetCategory;
			// Remove position number if moving to general
			if (draggedItemData.category === "general") {
				draggedItemData.position = undefined;
			}
		}

		// Remove from old position
		this.items.splice(draggedIndex, 1);

		// Find where to insert - at the end of items with the same category
		let insertIndex = this.items.length;
		for (let i = this.items.length - 1; i >= 0; i--) {
			if (this.items[i]!.category === targetCategory) {
				insertIndex = i + 1;
				break;
			}
		}

		// Insert at the new position
		this.items.splice(insertIndex, 0, draggedItemData);

		this.render();
		void this.saveData();
	}

	private async loadData(): Promise<void> {
		try {
			this.items = await this.plugin.loadPluginData();
		} catch (e) {
			console.error("Failed to load checklist data:", e);
			this.items = [];
		}
	}

	private async saveData(): Promise<void> {
		try {
			await this.plugin.savePluginData(this.items);
		} catch (e) {
			console.error("Failed to save checklist data:", e);
		}
	}

	getState(): Record<string, unknown> {
		return {
			items: this.items,
		};
	}

	setState(state: Record<string, unknown>, result: ViewStateResult): Promise<void> {
		// Only restore state if it has items AND we don't already have items loaded
		// This prevents overwriting plugin data that was just loaded in onOpen()
		if (state && Array.isArray(state.items) && state.items.length > 0 && this.items.length === 0) {
			this.items = state.items as ChecklistItem[];
			this.render();
		}
		return Promise.resolve();
	}
}
