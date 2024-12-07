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

(async () => {
	const stravaCredentials = await chrome.runtime.sendMessage({ "type": 'requestStravaCredentials' });
	const { isEnabled, stravaColor, heatmapAlpha, maxZoomLevel } = await getStravaOptions();
	const displayImageryScript = document.createElement('script');
	displayImageryScript.src = chrome.runtime.getURL('scripts/display-strava-imagery.js');
	displayImageryScript.dataset.isLoggedIn = stravaCredentials !== null;
	displayImageryScript.dataset.isEnabled = isEnabled;
	displayImageryScript.dataset.stravaColor = stravaColor;
	displayImageryScript.dataset.heatmapAlpha = heatmapAlpha;
	displayImageryScript.dataset.maxZoomLevel = maxZoomLevel;
	document.documentElement.appendChild(displayImageryScript);
})();

let currentHash = window.location.hash;

window.addEventListener('load', function (e) {
	setInterval(() => {
		if (window.location.hash !== currentHash) {
			chrome.runtime.sendMessage({ "type": 'updateHashParams', hash: window.location.hash }).then(() => currentHash = window.location.hash);
		}
	}, 1000)
});
