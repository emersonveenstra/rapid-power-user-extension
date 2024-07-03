async function saveOptions(e) {
	e.preventDefault();
	const stravaColor = document.querySelector('#strava-color').value;
	const enableStrava = document.querySelector('#enable-strava').checked;
	await chrome.storage.sync.set({
	  stravaColor: stravaColor,
	  enableStrava: enableStrava
	});
	document.querySelector('.saved').classList.remove('hidden');
	setTimeout(() => {
		document.querySelector('.saved').classList.add('hidden');
	}, 3000)
}
async function restoreOptions() {
	const { stravaColor } = await chrome.storage.sync.get('stravaColor');
	const { enableStrava } = await chrome.storage.sync.get('enableStrava');
	document.querySelector('#enable-strava').checked = enableStrava ?? true;
	document.querySelector('#strava-color').value = stravaColor ?? 'hot';
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);