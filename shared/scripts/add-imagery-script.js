chrome.runtime.sendMessage({"type": 'requestStravaCredentials'}).then(() => {
	const getStravaCredentials = chrome.runtime.sendMessage({"type": 'getStravaCredentials'}).then(stravaCredentials => {
		const displayImageryScript = document.createElement('script');
		displayImageryScript.src = chrome.runtime.getURL('scripts/display-strava-imagery.js');
		displayImageryScript.dataset.isLoggedIntoStrava = (stravaCredentials.credentials !== null) ? "true" : "false";
		displayImageryScript.dataset.stravaColor = "hot";
		document.documentElement.appendChild(displayImageryScript);
	});
});