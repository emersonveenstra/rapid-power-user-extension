async function saveOptions(e) {
	e.preventDefault();
	const useCanary = document.querySelector('#use-canary').checked;
	const hideAI = document.querySelector('#hide-ai').checked;
	const poweruserMode = document.querySelector('#poweruser-mode').checked;
	const enableStrava = document.querySelector('#enable-strava').checked;
	const stravaColor = document.querySelector('#strava-color').value;
	const heatmapOpacity = document.querySelector('#heatmap-opacity').value;
	await chrome.storage.sync.set({
		useCanary: useCanary,
		hideAI: hideAI,
		poweruserMode: poweruserMode,
		enableStrava: enableStrava,
		stravaColor: stravaColor,
		heatmapOpacity: heatmapOpacity
	});
	document.querySelector('.saved').classList.remove('hidden');
	setTimeout(() => {
		document.querySelector('.saved').classList.add('hidden');
	}, 3000)
	chrome.runtime.sendMessage({"type": 'refreshRapidRules'})
}
async function restoreOptions() {
	const { useCanary } = await chrome.storage.sync.get('useCanary');
	const { hideAI } = await chrome.storage.sync.get('hideAI');
	const { poweruserMode } = await chrome.storage.sync.get('poweruserMode');
	const { enableStrava } = await chrome.storage.sync.get('enableStrava');
	const { stravaColor } = await chrome.storage.sync.get('stravaColor');
	const { heatmapOpacity } = await chrome.storage.sync.get('heatmapOpacity');
	document.querySelector('#use-canary').checked = useCanary ?? false;
	document.querySelector('#hide-ai').checked = hideAI ?? false;
	document.querySelector('#poweruser-mode').checked = poweruserMode ?? false;
	document.querySelector('#enable-strava').checked = enableStrava ?? true;
	document.querySelector('#strava-color').value = stravaColor ?? 'hot';
	document.querySelector('#heatmap-opacity').value = heatmapOpacity ?? '100';

}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);