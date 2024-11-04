chrome.runtime.sendMessage({"type": 'requestStravaCredentials'}).then(async stravaCredentials => {
	const { enableStrava } = await chrome.storage.local.get('enableStrava');
	if (!enableStrava) {
		return;
	}
	const displayImageryScript = document.createElement('script');
	displayImageryScript.src = chrome.runtime.getURL('scripts/display-strava-imagery.js');
	displayImageryScript.dataset.isLoggedIntoStrava = (stravaCredentials !== null) ? "true" : "false";
	const { stravaColor } = await chrome.storage.local.get('stravaColor');
	const { heatmapOpacity } = await chrome.storage.local.get('heatmapOpacity');
	const { maxZoomLevel } = await chrome.storage.local.get('maxZoomLevel');
	const heatmapAlpha = parseInt(heatmapOpacity) / 100;
	displayImageryScript.dataset.stravaColor = stravaColor;
	displayImageryScript.dataset.heatmapAlpha = heatmapAlpha;
	displayImageryScript.dataset.maxZoomLevel = maxZoomLevel;
	document.documentElement.appendChild(displayImageryScript);
});