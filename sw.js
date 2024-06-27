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


let stravaCredentials = null;

async function clearStravaCookie(name) {
	return chrome.cookies.remove({ name, url: "https://www.strava.com/maps/global-heatmap" });
}

async function getStravaCookie(name) {
	const cookie = await chrome.cookies.get({
		url: 'https://www.strava.com/maps/global-heatmap',
		name: name,
	});
	if (!cookie)
		return null;

	const { expirationDate, value } = cookie;
	const nowInSeconds = Date.now() / 1000;
	if (expirationDate && expirationDate <= nowInSeconds) {
		return null;
	}
	else if (value === undefined) {
		return null;
	}
	else {
		return value;
	}
}

async function requestStravaCredentials() {
	const keyPairId = await getStravaCookie('CloudFront-Key-Pair-Id');
	const policy    = await getStravaCookie('CloudFront-Policy');
	const signature = await getStravaCookie('CloudFront-Signature');

	const error = !keyPairId || !policy || !signature;
	const credentials = error ? null : { keyPairId, policy, signature };

	chrome.declarativeNetRequest.updateDynamicRules({
		removeRuleIds: [ 1 ],
		addRules: credentials ? [
			{
				id: 1,
				priority: 1,
				condition: {
					regexFilter: "^https://heatmap-external-(.*).strava.com/tiles/(all|ride|run|water|winter)/(.*)/(.*)/(.*)/(.*).png\??(.*)",
					resourceTypes: ['main_frame', 'sub_frame', 'image'],
				},
				action: {
					type: 'redirect',
					redirect: {
						regexSubstitution: `https://heatmap-external-\\1.strava.com/tiles-auth/\\2/\\3/\\4/\\5/\\6.png?Key-Pair-Id=${keyPairId}&Policy=${policy}&Signature=${signature}`
					},
				}
			}
		] : []
	});

	stravaCredentials = credentials;
	if (credentials === null) {
		chrome.action.setIcon({ path: "icons/rapid-strava-48.png" });
		chrome.action.setTitle({ title: "Log Into Strava"});
	} else {
		chrome.action.setIcon({ path: "icons/rapid-48.png" });
		chrome.action.setTitle({ title: "Start Mapping"});
	}
}

async function clearStravaCredentials() {
	await clearStravaCookie('CloudFront-Key-Pair-Id');
	await clearStravaCookie('CloudFront-Policy');
	await clearStravaCookie('CloudFront-Signature');

	chrome.declarativeNetRequest.updateDynamicRules({
		removeRuleIds: [ 1 ]
	});

	stravaCredentials = null;
}


chrome.runtime.onMessage.addListener(async function(message) {
	if (message["type"] === 'requestStravaCredentials') {
		return requestStravaCredentials();
	}
	if (message["type"] === 'clearStravaCredentials') {
		return clearStravaCredentials();
	}
});

chrome.action.onClicked.addListener((tab) => {
	if (stravaCredentials === null) {
		chrome.tabs.create({
			url: 'https://www.strava.com/maps/global-heatmap'
		});
	}
	else {
		chrome.tabs.create({
			url: 'https://rapideditor.org/edit'
		});
	}
});

requestStravaCredentials();