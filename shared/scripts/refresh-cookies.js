let cookieInterval = null;
async function checkForCookies() {
	const stravaCredentials = await chrome.runtime.sendMessage({ "type": 'requestStravaCredentials' })
	if (stravaCredentials && cookieInterval) {
		window.clearInterval(cookieInterval);
	}
}
cookieInterval = window.setInterval(checkForCookies, 1000);