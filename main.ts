import {
	App,
	Editor,
	FileSystemAdapter,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	addIcon,
	normalizePath,
} from "obsidian";

const MEM_LOC_USER_VISIBLE_NAME = "Memory Palace";
// TODO: add an svg as an icon addIcon(iconId: string, svgContent: string): void;

interface MemLocPluginSettings {
	muteAll: boolean;
}

const DEFAULT_SETTINGS: MemLocPluginSettings = {
	muteAll: false,
};

export default class MemLocPlugin extends Plugin {
	settings: MemLocPluginSettings;

	async onload() {
		await this.loadSettings();
		this.registerView(MEMLOC_VIEW_TYPE, (leaf) => new MemLocView(leaf));

		addIcon("MEMPAL", memPalIconSVGTEXT);

		this.addRibbonIcon("MEMPAL", MEM_LOC_USER_VISIBLE_NAME, () => {
			this.activateView().then(function (_) {
				console.log("ACTIVATE");
				// assumes ma.js is in the root of the plugin
				// import("ma");
				// alternatively we need to add app://obsidian.md to cors setting on the server
				// import("https://localhost:8443/ma.js");
				// console.log("loaded?!");
			});
		});

		// This creates an icon in the left ribbon.
		// const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
		// 	// Called when the user clicks the icon.
		// 	new Notice('This is a notice!');
		// });
		// // Perform additional things with the ribbon
		// ribbonIconEl.addClass('my-plugin-ribbon-class');

		// // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('Status Bar Text');

		// // This adds a simple command that can be triggered anywhere
		// this.addCommand({
		// 	id: 'open-sample-modal-simple',
		// 	name: 'Open sample modal (simple)',
		// 	callback: () => {
		// 		new SampleModal(this.app).open();
		// 	}
		// });
		// // This adds an editor command that can perform some operation on the current editor instance
		// this.addCommand({
		// 	id: 'sample-editor-command',
		// 	name: 'Sample editor command',
		// 	editorCallback: (editor: Editor, view: MarkdownView) => {
		// 		console.log(editor.getSelection());
		// 		editor.replaceSelection('Sample Editor Command');
		// 	}
		// });
		// // This adds a complex command that can check whether the current state of the app allows execution of the command
		// this.addCommand({
		// 	id: 'open-sample-modal-complex',
		// 	name: 'Open sample modal (complex)',
		// 	checkCallback: (checking: boolean) => {
		// 		// Conditions to check
		// 		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		// 		if (markdownView) {
		// 			// If checking is true, we're simply "checking" if the command can be run.
		// 			// If checking is false, then we want to actually perform the operation.
		// 			if (!checking) {
		// 				new SampleModal(this.app).open();
		// 			}

		// 			// This command will only show up in Command Palette when the check function returns true
		// 			return true;
		// 		}
		// 	}
		// });

		// // This adds a settings tab so the user can configure various aspects of the plugin
		// this.addSettingTab(new SampleSettingTab(this.app, this));

		// // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// // Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	console.log('click', evt);
		// });

		// // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(MEMLOC_VIEW_TYPE);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getRightLeaf(false);
			await leaf?.setViewState({ type: MEMLOC_VIEW_TYPE, active: true });
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		if (leaf !== null) {
			workspace.revealLeaf(leaf);
		}
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}

import { ItemView, WorkspaceLeaf } from "obsidian";

export const MEMLOC_VIEW_TYPE = "memloc-main-view";

export class MemLocView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return MEMLOC_VIEW_TYPE;
	}

	getDisplayText() {
		return "Memory Palace";
	}

	saveIt = async (app: App, e: CustomEvent) => {
		console.log("let's save the world");
		console.log("this is ", app, typeof app);
		// TODO: do an atomic write using e.detail.get("save_name") or something
		var snapshot = await e.detail.get("save_data");
		// var np = normalizePath("ma_snapshot.json");
		let filename = await app.fileManager.getAvailablePathForAttachment(
			`snapshot.json`
		);
		console.log("normalizedFile:", filename);
		this.app.vault.create(filename, snapshot);

		// this.app.valut.adapter
		// 	.write(np, snapshot)
		// 	.then(() => {
		// 		console.log("write ok");
		// 	})
		// 	.catch((e) => {
		// 		console.error(`failed to write ${e}`);
		// 	});
	};

	loadTheGame(app: App, saveIt) {
		var maSource = "https://localhost:8443/ma.js";
		var s = document.createElement("script");
		s.setAttribute("id", "ma_js_script");
		s.setAttribute("type", "text/javascript");
		s.setAttribute("src", maSource);
		document.body.appendChild(s);

		let evl = function (e: CustomEvent) {
			console.log(
				`EVENT ${e.type} -> ${JSON.stringify(e.detail.keys())}`
			);
			// "memloc_save_data";
			// "memloc_load_data";
			// "memloc_show_note";
			// "memloc_show_new_note_dialog";

			var cmd = e.detail.get("cmd");
			if (cmd === "memloc_show_new_note_dialog") {
				console.log("SHOW THE DAMN NEW NOTE DIALOG");
			} else if (cmd === "memloc_show_note") {
				console.log("SHOW THE NOTE ");
			} else if (cmd === "memloc_load_data") {
				console.log("let's load data and send it in");
				var snapshot = this.app.loadData();
				console.log(`this is the data I loaded:\n ${snapshot} `);
				document.dispatchEvent(
					new CustomEvent("memloc_call_in", snapshot)
				);
			} else if (cmd === "memloc_save_data") {
				saveIt(app, e);
			} else {
				console.error(`got a command I don't understand: ${cmd}`);
			}

			if (e.detail.get("loading_spinner") === "show") {
				setTimeout(() => {
					var loadingIndicator = document.getElementById("root");
					if (!!loadingIndicator) {
						loadingIndicator.hidden = false;
					}
					console.log("show the spinner");
				}, 50);
			}
			if (e.detail.get("loading_spinner") === "hide") {
				setTimeout(() => {
					var loadingIndicator = document.getElementById("root");
					if (!!loadingIndicator) {
						loadingIndicator.hidden = true;
					}
					console.log("hide the spinner");
				}, 50);
			}
		};
		window.addEventListener("memloc_custom_event", evl);
		document.body.addEventListener("memloc_custom_event", evl);

		console.log("we are ready to go");
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		container.createEl("h4", { text: "Example view" });
		container.createEl("canvas", {
			attr: { id: "webgl", style: "width: 100%; height: 100%" },
		});
		// container.createEl("script", { attr: { src: "ma.js" } });
		console.log("we have a canvas");
		console.log(`${document.getElementById("webgl")}`);
		this.loadTheGame(this.app, this.saveIt);
	}

	async onClose() {
		// Nothing to clean up.
	}
}

const memPalIconSVGTEXT = `
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!-- Created with Inkscape (http://www.inkscape.org/) -->

<svg
   width="30mm"
   height="30mm"
   viewBox="0 0 29.999999 30"
   version="1.1"
   id="svg1"
   xml:space="preserve"
   inkscape:version="1.3.2 (091e20e, 2023-11-25)"
   sodipodi:docname="MemPalIcon_A_01.svg"
   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:svg="http://www.w3.org/2000/svg"><sodipodi:namedview
     id="namedview1"
     borderopacity="0.25"
     inkscape:showpageshadow="2"
     inkscape:pageopacity="0.0"
     inkscape:pagecheckerboard="0"
     inkscape:document-units="mm"
     inkscape:zoom="6.5747121"
     inkscape:cx="64.717663"
     inkscape:cy="56.88462"
     inkscape:window-width="2048"
     inkscape:window-height="1227"
     inkscape:window-x="0"
     inkscape:window-y="26"
     inkscape:window-maximized="0"
     inkscape:current-layer="layer1" /><defs
     id="defs1" /><g
     inkscape:label="Layer 1"
     inkscape:groupmode="layer"
     id="layer1"><path
       style="fill:#888;stroke:none;stroke-width:1.28585"
       d="m 11.303577,0.90922897 -0.0097,2.39495163 2.147899,0.010911 V 0.90940627 H 11.30342 m 5.13208,0 V 3.3150913 h 2.138369 V 0.90940627 H 16.4355 M 8.7373739,3.7962174 V 6.2019025 H 10.875743 V 3.7962174 H 8.7373739 m 5.1320801,0 0.03977,2.4504059 2.098617,-0.044735 -0.03576,-2.3653969 -2.102569,-0.040233 m 2.566045,2.4056851 h 2.13837 C 18.461658,5.7725756 18.717455,4.6861719 18.383125,4.2992197 17.952382,3.8006909 16.909328,4.0500849 16.697866,4.0188254 c -0.420597,-0.062191 0.02522,1.0828577 -0.262318,2.183118 m 2.566046,-2.4056851 v 2.4056851 h 2.138358 L 21.062001,3.9232058 18.961891,3.7068306 M 8.7374709,6.6830832 V 9.0887688 H 10.87584 V 6.6830832 H 8.7374709 m 2.5660461,0 v 2.4056856 h 2.138357 V 6.6830832 h -2.138357 m 2.566033,0 v 2.4056856 h 2.13837 V 6.6830832 h -2.13837 m 5.132092,0 V 9.0887688 H 21.14 V 6.6830832 H 19.001642 M 8.7374709,9.5699086 C 7.9888736,13.590789 8.9814118,16.737292 10.87584,20.154913 7.9563026,22.322293 7.1519078,25.000339 7.0267763,28.815375 H 22.423029 C 22.3983,25.209786 22.081863,22.398274 19.001642,20.636054 23.879818,8.1855306 17.536598,10.551622 8.7374709,9.5699086 M 20.284659,13.900138 c -0.438986,3.513405 -1.525028,6.114135 -4.704415,7.217041 l -2.068408,-0.32371 c -9.0888739,-5.75697 0.158557,-9.727989 6.772823,-6.893331"
       id="path1"
       sodipodi:nodetypes="ccccccccccccccccccccccsscccccccccccccccccccccccccccccccccccc" /></g></svg>
`;
