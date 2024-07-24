import { Rapid } from './lib/Rapid.js'
const rapid = new Rapid();
import { Strava } from './lib/Strava.js'
const strava = new Strava();

chrome.action.onClicked.addListener(async (tab) => {
	const { enableStrava } = await chrome.storage.sync.get('enableStrava');
	if (strava.stravaCredentials === null && enableStrava) {
		chrome.tabs.create({
			url: 'https://www.strava.com/maps/global-heatmap'
		});
	}
	else {
		chrome.tabs.create({
			url: 'https://rapideditor.org/edit'
		});
	}
});

(async () => {
	await rapid.setRapidDefaults();
	await rapid.updateDynamicRules();
	await strava.setStravaDefaults();
	await strava.requestStravaCredentials();
})();
