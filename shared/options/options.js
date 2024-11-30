async function saveOptions(e) {
	e.preventDefault();
	const useCanary = document.querySelector('#use-canary').checked;
	const poweruserMode = document.querySelector('#poweruser-mode').checked;
	const showBuildings = document.querySelector('#show-buildings').checked;
	const showRoads = document.querySelector('#show-roads').checked;
	const extraDatasets = document.querySelector('#extra-datasets').value;
	const defaultBackground = document.querySelector('#default-background').value;
	const disableFeatures = document.querySelector('#disable-features').value;

	const enableStrava = document.querySelector('#enable-strava').checked;
	const stravaColor = document.querySelector('#strava-color').value;
	const heatmapOpacity = document.querySelector('#heatmap-opacity').value;
	const maxZoomLevel = document.querySelector('#max-zoom-level').value;

	await chrome.storage.local.set({
		useCanary: useCanary,
		poweruserMode: poweruserMode,
		showBuildings:showBuildings,
		showRoads: showRoads,
		extraDatasets: extraDatasets,
		defaultBackground: defaultBackground,
		disableFeatures: disableFeatures,

		enableStrava: enableStrava,
		stravaColor: stravaColor,
		heatmapOpacity: heatmapOpacity,
		maxZoomLevel: maxZoomLevel
	});

	document.querySelector('.saved').classList.remove('hidden');
	setTimeout(() => {
		document.querySelector('.saved').classList.add('hidden');
	}, 3000)
	chrome.runtime.sendMessage({"type": 'refreshRapidRules'})
	chrome.runtime.sendMessage({"type": 'requestStravaCredentials'})
}

function toggleStravaOptions() {
	const enableStrava = document.querySelector('#enable-strava').checked;

	document.querySelector('#strava-color').disabled = !enableStrava;
	document.querySelector('#heatmap-opacity').disabled = !enableStrava;
	document.querySelector('#max-zoom-level').disabled = !enableStrava;
}
async function restoreOptions() {
	const { useCanary } = await chrome.storage.local.get('useCanary');
	const { poweruserMode } = await chrome.storage.local.get('poweruserMode');
	const { showBuildings } = await chrome.storage.local.get('showBuildings');
	const { showRoads } = await chrome.storage.local.get('showRoads');
	const { extraDatasets } = await chrome.storage.local.get('extraDatasets');
	const { defaultBackground } = await chrome.storage.local.get('defaultBackground');
	const { disableFeatures } = await chrome.storage.local.get('disableFeatures');

	const { enableStrava } = await chrome.storage.local.get('enableStrava');
	const { stravaColor } = await chrome.storage.local.get('stravaColor');
	const { heatmapOpacity } = await chrome.storage.local.get('heatmapOpacity');
	const { maxZoomLevel } = await chrome.storage.local.get('maxZoomLevel');

	document.querySelector('#use-canary').checked = useCanary ?? false;
	document.querySelector('#poweruser-mode').checked = poweruserMode ?? false;
	document.querySelector('#show-buildings').checked = showBuildings ?? false;
	document.querySelector('#show-roads').checked = showRoads ?? false;
	document.querySelector('#extra-datasets').value = extraDatasets ?? "";
	document.querySelector('#default-background').value = defaultBackground ?? "Bing";
	document.querySelector('#disable-features').value = disableFeatures ?? "boundaries";

	document.querySelector('#enable-strava').checked = enableStrava ?? true;
	document.querySelector('#strava-color').value = stravaColor ?? 'hot';
	document.querySelector('#heatmap-opacity').value = heatmapOpacity ?? '100';
	document.querySelector('#max-zoom-level').value = maxZoomLevel ?? '20';
	toggleStravaOptions();
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
document.querySelector('#enable-strava').addEventListener('change', toggleStravaOptions);