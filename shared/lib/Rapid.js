export class Rapid {
	constructor() {
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			if (message["type"] === 'refreshRapidRules') {
				this.updateDynamicRules();
			}
		});
	}

	async setRapidDefaults() {
		const { useCanary } = await chrome.storage.local.get('useCanary');
		if (useCanary === undefined) {
			await chrome.storage.local.set({
				useCanary: false
			});
		}
		const { poweruserMode } = await chrome.storage.local.get('poweruserMode');
		if (poweruserMode === undefined) {
			await chrome.storage.local.set({
				poweruserMode: false
			});
		}
		const { showBuildings } = await chrome.storage.local.get('showBuildings');
		if (showBuildings === undefined) {
			await chrome.storage.local.set({
				showBuildings: true
			});
		}
		const { showRoads } = await chrome.storage.local.get('showRoads');
		if (showRoads === undefined) {
			await chrome.storage.local.set({
				showRoads: true
			});
		}
		const { extraDatasets } = await chrome.storage.local.get('extraDatasets');
		if (extraDatasets === undefined) {
			await chrome.storage.local.set({
				extraDatasets: ""
			});
		}
		const { defaultBackground } = await chrome.storage.local.get('defaultBackground');
		if (defaultBackground === undefined) {
			await chrome.storage.local.set({
				defaultBackground: "Bing"
			});
		}
		const { disableFeatures } = await chrome.storage.local.get('disableFeatures');
		if (disableFeatures === undefined) {
			await chrome.storage.local.set({
				disableFeatures: "boundaries"
			});
		}
	}

	async updateDynamicRules() {
		const { useCanary } = await chrome.storage.local.get('useCanary');
		const { poweruserMode } = await chrome.storage.local.get('poweruserMode');
		const { showBuildings } = await chrome.storage.local.get('showBuildings');
		const { showRoads } = await chrome.storage.local.get('showRoads');
		const { extraDatasets } = await chrome.storage.local.get('extraDatasets');
		const { defaultBackground } = await chrome.storage.local.get('defaultBackground');
		const { disableFeatures } = await chrome.storage.local.get('disableFeatures');
		const datasets = []
		if (showRoads) {
			datasets.push("fbRoads")
		}
		if (showBuildings) {
			datasets.push("msBuildings")
		}
		if (extraDatasets != "") {
			datasets.push(extraDatasets)
		}
		let queryParams = [
			`datasets=${datasets.join(",")}`,
			`background=${defaultBackground}`,
			`disable_features=${disableFeatures}`
		].join('&')
		if (poweruserMode) {
			queryParams = `${queryParams}&poweruser=true`
		}
		const rapidPath = (useCanary) ? "canary" : "edit";

		chrome.declarativeNetRequest.updateDynamicRules({
			removeRuleIds: [ 3,4,5,6,7,8 ],
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
							regexSubstitution: `https://rapideditor.org/${rapidPath}#map=\\1&${queryParams}`
						},
					}
				},
				{
					id: 4,
					priority: 1,
					condition: {
						regexFilter: "^https://www.openstreetmap.org/edit\\?node=(\\d+)(.*)$",
						resourceTypes: ['main_frame'],
					},
					action: {
						type: 'redirect',
						redirect: {
							regexSubstitution: `https://rapideditor.org/${rapidPath}#id=n\\1&${queryParams}`
						},
					}
				},
				{
					id: 5,
					priority: 1,
					condition: {
						regexFilter: "^https://www.openstreetmap.org/edit\\?way=(\\d+)(.*)$",
						resourceTypes: ['main_frame'],
					},
					action: {
						type: 'redirect',
						redirect: {
							regexSubstitution: `https://rapideditor.org/${rapidPath}#id=w\\1&${queryParams}`
						},
					}
				},
				{
					id: 6,
					priority: 1,
					condition: {
						regexFilter: "^https://www.openstreetmap.org/edit\\?relation=(\\d+)(.*)$",
						resourceTypes: ['main_frame'],
					},
					action: {
						type: 'redirect',
						redirect: {
							regexSubstitution: `https://rapideditor.org/${rapidPath}#id=r\\1&${queryParams}`
						},
					}
				},
				{
					id: 7,
					priority: 1,
					condition: {
						regexFilter: "^https://www.openstreetmap.org/edit\\?changeset=\\d+#map=(.*)$",
						resourceTypes: ['main_frame'],
					},
					action: {
						type: 'redirect',
						redirect: {
							regexSubstitution: `https://rapideditor.org/${rapidPath}#map=\\1&${queryParams}`
						},
					}
				},
				{
					id: 8,
					priority: 1,
					condition: {
						regexFilter: "^https://www.openstreetmap.org/edit\\?note=\\d+#map=(.*)$",
						resourceTypes: ['main_frame'],
					},
					action: {
						type: 'redirect',
						redirect: {
							regexSubstitution: `https://rapideditor.org/${rapidPath}#map=\\1&${queryParams}`
						},
					},
				},
			]
		});
	}
}