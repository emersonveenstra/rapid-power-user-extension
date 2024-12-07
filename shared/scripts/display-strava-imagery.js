// Parts of this code are taken from https://github.com/cmoffroad/id-strava-heatmap-extension
// The MIT License (MIT)

// Copyright (c) 2023-Present Julien ETIENNE

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

function initStravaHeatmapImagery() {
	const stravaScript = document.querySelector('script[data-is-logged-in]');
	const isEnabled = stravaScript.dataset.isEnabled === "true";
	if (!isEnabled) {
		return;
	}
	const isLoggedIn = stravaScript.dataset.isLoggedIn === "true";
	const stravaColor = stravaScript.dataset.stravaColor;
	const heatmapAlpha = parseFloat(stravaScript.dataset.heatmapAlpha);
	const maxZoomLevel = parseInt(stravaScript.dataset.maxZoomLevel);
	const stravaImageryData = [];
	for (const imageryType of  ["Ride", "Run", "Water", "Winter", "All"]) {
		const desc = (isLoggedIn) ? `The Strava Heatmap (${imageryType}) shows heat made by aggregated, public activities over the last year.` : `You must be logged into Strava to use this imagery`;
		stravaImageryData.push({
			id: `StravaHeatmap${imageryType}`,
			name: `Strava Heatmap (${imageryType})`,
			description: desc,
			template: `https://heatmap-external-{switch:a,b,c}.strava.com/tiles/${imageryType.toLowerCase()}/${stravaColor}/{zoom}/{x}/{y}.png?v=19`,
			terms_url: "https://wiki.openstreetmap.org/wiki/Strava#Data_Permission_-_Allowed_for_tracing!",
			zoomExtent: [0, 15],
			zoomRange: maxZoomLevel - 15,
			overlay: true,
			alpha: heatmapAlpha
		});
	}
	return stravaImageryData;
}

// override global fetch function used by iD to retrieve imagery json file
const { fetch: originalFetch } = window;
window.fetch = async (...args) => {

	const [resource, config] = args;

	const response = await originalFetch(resource, config);

	if (resource.match('/data/imagery.')) {
		const json = () => response
			.clone()
			.json()
			.then(data => {
				return {
					"_meta": data["_meta"],
					"imagery": [
						...data["imagery"],
						...initStravaHeatmapImagery()
					]
				}
			});
		response.json = json;
	}
	return response;
};

function updateStravaCheckboxes() {
	const stravaScript = document.querySelector('script[data-is-logged-in]');
	const isLoggedIn = stravaScript.dataset.isLoggedIn === "true";
	document.querySelectorAll('.layer-overlay-list li label').forEach(e => {
		const title = e.querySelector('span');
		if (!title) {
			return;
		}
		if (title.textContent.startsWith("Strava")) {
			e.querySelector('input').disabled = !isLoggedIn;
		}
	})
}

const stravaScript = document.querySelector('script[data-is-logged-in]');
if (stravaScript.dataset.isLoggedIn !== "true" || stravaScript.dataset.isEnabled !== "true") {
	const checkboxObserver = new MutationObserver(updateStravaCheckboxes);
	const checkForOverlays = setInterval(() => {
		const overlayList = document.querySelector('.layer-overlay-list');
		if (overlayList) {
			checkboxObserver.observe(overlayList, {childList: true, subtree: true, characterData: true});
			clearInterval(checkForOverlays);
		}
		updateStravaCheckboxes();
	}, 2000)
}