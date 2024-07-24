chrome.runtime.sendMessage({"type": 'requestStravaCredentials'}).then(async () => {
	const { enableStrava } = await chrome.storage.sync.get('enableStrava');
	if (!enableStrava) {
		return;
	}
	chrome.runtime.sendMessage({"type": 'getStravaCredentials'}).then(async stravaCredentials => {
		const displayImageryScript = document.createElement('script');
		displayImageryScript.src = chrome.runtime.getURL('scripts/display-strava-imagery.js');
		displayImageryScript.dataset.isLoggedIntoStrava = (stravaCredentials.credentials !== null) ? "true" : "false";
		const { stravaColor } = await chrome.storage.sync.get('stravaColor');
		const { heatmapOpacity } = await chrome.storage.sync.get('heatmapOpacity');
		const heatmapAlpha = parseInt(heatmapOpacity) / 100;
		displayImageryScript.dataset.stravaColor = stravaColor;
		displayImageryScript.dataset.heatmapAlpha = heatmapAlpha;
		document.documentElement.appendChild(displayImageryScript);
	});
});