export interface ChecklistItem {
	id: string;
	text: string;
	completed: boolean;
	category: "next-steps" | "general";
	position?: number; // Position number for next-steps category
}
