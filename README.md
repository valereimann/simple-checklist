# Simple Checklist

A lightweight and intuitive checklist plugin for [Obsidian](https://obsidian.md/) that helps you organize and track tasks with ease.

## Features

✨ **Quick task entry** - Add items instantly with just a few keystrokes  
📋 **Two-list system** - Organize tasks into "Next Steps" and "General" categories  
🔢 **Auto-numbering** - Items in "Next Steps" are automatically numbered  
✅ **Checkbox support** - Mark items as complete with a single click  
✏️ **Edit on click** - Quickly modify any task by clicking on its text  
🎯 **Drag & drop** - Reorder tasks within and between lists with smooth drag & drop  
💾 **Persistent storage** - All your tasks are automatically saved  

## Installation

### From Obsidian Community Plugins

1. Open Obsidian Settings
2. Go to **Settings → Community plugins → Browse**
3. Search for "Simple Checklist"
4. Click **Install** and then **Enable**

### Manual Installation (Development)

1. Clone this repository to `.obsidian/plugins/simple-checklist/` in your vault
2. Run `npm install` in the plugin directory
3. Run `npm run dev` to start the development watch mode
4. Reload Obsidian to load the plugin

## Usage

### Opening the Checklist

Use the command palette (**Ctrl/Cmd + P**) and search for "Open checklist" to open the checklist panel.

### Adding Items

Type your task in the input field at the top and press **Enter** to add it:

- **Next Steps list** (default) - Just type your task normally
- **General list** - Start your task with `--` prefix (e.g., `-- buy groceries`)

### Managing Tasks

- **Check off completed tasks** - Click the checkbox next to any item
- **Edit a task** - Click on the task text to edit it. Press **Enter** to save or **Escape** to cancel
- **Delete a task** - Click the trash icon (🗑️) on the right side of the item
- **Reorder tasks** - Drag the three-dot handle (⋮) to move tasks up/down, or between lists

### Auto-Numbering

Items in the "Next Steps" list are automatically numbered. When you reorder or move items between lists, the numbering updates automatically:

```
Next Steps          General
1. Buy milk        -- Finish report
2. Call mom        -- Check emails
3. Do laundry
```

## Tips

- Use "Next Steps" for your priority tasks and "General" for everything else
- Drag tasks between lists to change their priority at any time
- All changes are saved automatically to your vault

## Development

### Setup

```bash
npm install
```

### Build for Development

```bash
npm run dev
```

This starts the TypeScript compiler in watch mode and bundles changes automatically.

### Build for Production

```bash
npm run build
```

This creates a minified `main.js` ready for release.

### Code Structure

```
src/
├── main.ts       # Plugin entry point and data persistence
├── view.ts       # UI rendering and user interactions
├── settings.ts   # Settings interface (placeholder)
└── types.ts      # TypeScript type definitions
```

## Data Storage

The plugin automatically saves all your tasks using Obsidian's plugin data API. Your checklist data is stored securely in your vault's `.obsidian/plugins/simple-checklist/` directory and persists across sessions.

## License

This plugin is released under the MIT License. See [LICENSE](LICENSE) for details.

## Support

If you encounter any issues or have feature requests, please open an issue on [GitHub](https://github.com/valereimann/simple-checklist).

## Credits

Built with ❤️ using the [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin) as a foundation.
