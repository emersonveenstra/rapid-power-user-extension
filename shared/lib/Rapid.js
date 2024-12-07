export class Rapid {
	constructor() {}

	async updateDynamicOptions(hash) {
		const { updateDynamically } = await chrome.storage.local.get('updateDynamically');
		if (!updateDynamically) {
			return;
		}
		const { otherParams } = await chrome.storage.local.get('otherParams');
		const otherParamKeys = []
		otherParams.split(',').forEach(param => otherParamKeys.push(param.split('=')[0]));
		const newOtherParamsArray = [];
		const hashArray = hash.slice(1).split('&');
		for (const hash of hashArray) {
			const [key, value] = hash.split('=', 2);
			switch (key) {
				case 'datasets':
					const datasetArray = value.split(',');
					await chrome.storage.local.set({
						showRoads: datasetArray.includes('fbRoads'),
						showBuildings: datasetArray.includes('msBuildings'),
						extraDatasets: datasetArray.filter(dataset => dataset !== 'fbRoads' && dataset !== 'msBuildings').join(',')
					});
					break;
				case 'background':
					await chrome.storage.local.set({ backgroundLayer: value });
					break;
				case 'overlays':
					await chrome.storage.local.set({ overlayLayers: value });
					break;
				case 'disable_features':
					await chrome.storage.local.set({ disableFeatures: value });
					break;
				case 'poweruser':
					await chrome.storage.local.set({ poweruserMode: value === 'true' });
					break;
				default:
					if (otherParamKeys.includes(key)) {
						newOtherParamsArray.push(`${key}=${value}`);
					}
					break;
			}
			await chrome.storage.local.set({ otherParams: newOtherParamsArray.join(',') });
		}
		this.updateDynamicRules();
	}

	async setRapidDefaults() {
		const { useCanary } = await chrome.storage.local.get('useCanary');
		if (useCanary === undefined) {
			await chrome.storage.local.set({
				useCanary: false
			});
		}
		const { updateDynamically } = await chrome.storage.local.get('updateDynamically');
		if (updateDynamically === undefined) {
			await chrome.storage.local.set({
				updateDynamically: false
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
		const { backgroundLayer } = await chrome.storage.local.get('backgroundLayer');
		if (backgroundLayer === undefined) {
			await chrome.storage.local.set({
				backgroundLayer: "Bing"
			});
		}
		const { overlayLayers } = await chrome.storage.local.get('overlayLayers');
		if (overlayLayers === undefined) {
			await chrome.storage.local.set({
				overlayLayers: ""
			});
		}
		const { disableFeatures } = await chrome.storage.local.get('disableFeatures');
		if (disableFeatures === undefined) {
			await chrome.storage.local.set({
				disableFeatures: "boundaries"
			});
		}
		const { otherParams } = await chrome.storage.local.get('otherParams');
		if (otherParams === undefined) {
			await chrome.storage.local.set({
				otherParams: ""
			});
		}
	}

	async getRapidBaseURL() {
		const { useCanary } = await chrome.storage.local.get('useCanary');
		const { poweruserMode } = await chrome.storage.local.get('poweruserMode');
		const { showBuildings } = await chrome.storage.local.get('showBuildings');
		const { showRoads } = await chrome.storage.local.get('showRoads');
		const { extraDatasets } = await chrome.storage.local.get('extraDatasets');
		const { backgroundLayer } = await chrome.storage.local.get('backgroundLayer');
		const { overlayLayers } = await chrome.storage.local.get('overlayLayers');
		const { disableFeatures } = await chrome.storage.local.get('disableFeatures');
		const { otherParams } = await chrome.storage.local.get('otherParams');
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
			`background=${backgroundLayer}`,
			`overlays=${overlayLayers}`,
			`disable_features=${disableFeatures}`
		].join('&')
		if (otherParams) {
			queryParams = `${queryParams}&${otherParams}`
		}
		if (poweruserMode) {
			queryParams = `${queryParams}&poweruser=true`
		}
		const rapidPath = (useCanary) ? "canary" : "edit";
		return `https://rapideditor.org/${rapidPath}#${queryParams}`;
	}


	async updateDynamicRules() {
		const rapidBaseURL = await this.getRapidBaseURL();

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
							regexSubstitution: `${rapidBaseURL}&map=\\1`
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
							regexSubstitution: `${rapidBaseURL}&id=n\\1`
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
							regexSubstitution: `${rapidBaseURL}&id=w\\1`
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
							regexSubstitution: `${rapidBaseURL}&id=r\\1`
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
							regexSubstitution: `${rapidBaseURL}&map=\\1`
						},
					}
				},
				{
					id: 8,
					priority: 1,
					condition: {
						regexFilter: "^https://www.openstreetmap.org/edit\\?note=(\\d+)(.*)$",
						resourceTypes: ['main_frame'],
					},
					action: {
						type: 'redirect',
						redirect: {
							regexSubstitution: `${rapidBaseURL}&note=\\1`
						},
					},
				},
			]
		});
	}
}