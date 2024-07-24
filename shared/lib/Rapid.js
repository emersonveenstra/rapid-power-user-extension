export class Rapid {
	constructor() {
		this.rapidPath = "edit"
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			if (message["type"] === 'refreshRapidRules') {
				this.updateDynamicRules();
			}
		});
	}

	async setRapidDefaults() {
		const { useCanary } = await chrome.storage.sync.get('useCanary');
		if (useCanary === undefined) {
			await chrome.storage.sync.set({
				useCanary: false
			});
		}
		const { hideAI } = await chrome.storage.sync.get('hideAI');
		if (hideAI === undefined) {
			await chrome.storage.sync.set({
				hideAI: false
			});
		}
		const { poweruserMode } = await chrome.storage.sync.get('poweruserMode');
		if (poweruserMode === undefined) {
			await chrome.storage.sync.set({
				poweruserMode: false
			});
		}
	}

	async updateDynamicRules() {
		const { useCanary } = await chrome.storage.sync.get('useCanary');
		const { hideAI } = await chrome.storage.sync.get('hideAI');
		const { poweruserMode } = await chrome.storage.sync.get('poweruserMode');
		let hashSettings = (hideAI) ? "&datasets=" : "";
		if (poweruserMode) {
			hashSettings = `${hashSettings}&poweruser=true`
		}
		this.rapidPath = (useCanary) ? "canary" : "edit";
		chrome.declarativeNetRequest.updateDynamicRules({
			removeRuleIds: [ 3,4,5,6,7 ],
			addRules: [
				{
					id: 3,
					priority: 1,
					condition: {
						regexFilter: "^https://www.openstreetmap.org/edit#map=(.*)$",
						resourceTypes: ['main_frame'],
					},
					action: {
						type: 'redirect',
						redirect: {
							regexSubstitution: `https://rapideditor.org/${this.rapidPath}#map=\\1${hashSettings}`
						},
					}
				},
				{
					id: 4,
					priority: 1,
					condition: {
						regexFilter: "^https://www.openstreetmap.org/edit.*node=(\\d+)(.*)$",
						resourceTypes: ['main_frame'],
					},
					action: {
						type: 'redirect',
						redirect: {
							regexSubstitution: `https://rapideditor.org/${this.rapidPath}#id=n\\1${hashSettings}`
						},
					}
				},
				{
					id: 5,
					priority: 1,
					condition: {
						regexFilter: "^https://www.openstreetmap.org/edit.*way=(\\d+)(.*)$",
						resourceTypes: ['main_frame'],
					},
					action: {
						type: 'redirect',
						redirect: {
							regexSubstitution: `https://rapideditor.org/${this.rapidPath}#id=w\\1${hashSettings}`
						},
					}
				},
				{
					id: 6,
					priority: 1,
					condition: {
						regexFilter: "^https://www.openstreetmap.org/edit.*relation=(\\d+)(.*)$",
						resourceTypes: ['main_frame'],
					},
					action: {
						type: 'redirect',
						redirect: {
							regexSubstitution: `https://rapideditor.org/${this.rapidPath}#id=r\\1${hashSettings}`
						},
					}
				},
				{
					id: 7,
					priority: 1,
					condition: {
						regexFilter: "^https://www.openstreetmap.org/edit.*changeset=\\d+#map=(.*)$",
						resourceTypes: ['main_frame'],
					},
					action: {
						type: 'redirect',
						redirect: {
							regexSubstitution: `https://rapideditor.org/${this.rapidPath}#map=\\1${hashSettings}`
						},
					}
				},
			]
		});
	}
}