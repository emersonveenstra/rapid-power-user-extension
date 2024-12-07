import { Rapid } from './lib/Rapid.js'
import { Strava } from './lib/Strava.js'
const rapid = new Rapid();
const strava = new Strava();

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
	if (message["type"] === 'refreshRapidRules') {
		await rapid.updateDynamicRules();
	}
	if (message["type"] === 'updateRapidOptions') {
		rapid.updateOptionsFromHash(message.options).then(() => sendResponse(true));
	}
	if (message["type"] === 'requestStravaCredentials') {
		strava.requestStravaCredentials().then(credentials => sendResponse(credentials));
	}
	if (message["type"] === 'clearStravaCredentials') {
		strava.clearStravaCredentials().then(() => sendResponse(true));
	}
	if (message["type"] === 'updateHashParams') {
		await rapid.updateDynamicOptions(message.hash);
	}
});

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
