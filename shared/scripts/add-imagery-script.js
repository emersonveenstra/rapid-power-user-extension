async function getStravaOptions() {
	const { enableStrava } = await chrome.storage.local.get('enableStrava');
	const { stravaColor } = await chrome.storage.local.get('stravaColor');
	const { heatmapOpacity } = await chrome.storage.local.get('heatmapOpacity');
	const { maxZoomLevel } = await chrome.storage.local.get('maxZoomLevel');
	const isEnabled = enableStrava;
	const heatmapAlpha = parseInt(heatmapOpacity) / 100;
	return {
		isEnabled: isEnabled,
		stravaColor: stravaColor,
		heatmapAlpha: heatmapAlpha,
		maxZoomLevel: maxZoomLevel
	}
}
const port = chrome.runtime.connect({ name: 'rapid-power-user-extension' });
port.onMessage.addListener(async (message) => {
	if (message.type === 'updateStravaScript') {
		chrome.runtime.sendMessage({ "type": 'requestStravaCredentials' }).then(async stravaCredentials => {
			const newStravaOptions = await getStravaOptions();
			newStravaOptions.isLoggedIn = stravaCredentials !== null;
			window.postMessage({
				type: 'refreshStravaOptions',
				options: newStravaOptions
			})
		});
	}
});

chrome.runtime.sendMessage({ "type": 'requestStravaCredentials' }).then(async stravaCredentials => {
	const { isEnabled, stravaColor, heatmapAlpha, maxZoomLevel } = await getStravaOptions();
	const displayImageryScript = document.createElement('script');
	displayImageryScript.src = chrome.runtime.getURL('scripts/display-strava-imagery.js');
	displayImageryScript.dataset.isLoggedIn = stravaCredentials !== null;
	displayImageryScript.dataset.isEnabled = isEnabled;
	displayImageryScript.dataset.stravaColor = stravaColor;
	displayImageryScript.dataset.heatmapAlpha = heatmapAlpha;
	displayImageryScript.dataset.maxZoomLevel = maxZoomLevel;
	document.documentElement.appendChild(displayImageryScript);
});

let currentHash = window.location.hash;

window.addEventListener('load', function (e) {
	setInterval(() => {
		if (window.location.hash !== currentHash) {
			chrome.runtime.sendMessage({ "type": 'updateHashParams', hash: window.location.hash }).then(() => currentHash = window.location.hash);
			console.log(window.location.hash);
		}
	}, 1000)
});
