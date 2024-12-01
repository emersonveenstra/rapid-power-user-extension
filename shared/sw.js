import { Rapid } from './lib/Rapid.js'
const rapid = new Rapid();
import { Strava } from './lib/Strava.js'
const strava = new Strava();

chrome.action.onClicked.addListener(async (tab) => {
	const rapidBaseURL = await rapid.getRapidBaseURL();
	const { enableStrava } = await chrome.storage.local.get('enableStrava');
	const stravaCredentials = await strava.requestStravaCredentials();
	if (stravaCredentials === null && enableStrava) {
		chrome.tabs.create({
			url: 'https://www.strava.com/maps/global-heatmap'
		});
	}
	else {
		chrome.tabs.create({
			url: rapidBaseURL
		});
	}
});

(async () => {
	await rapid.setRapidDefaults();
	await rapid.updateDynamicRules();
	await strava.setStravaDefaults();
	await strava.requestStravaCredentials();
})();
