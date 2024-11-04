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

export class Strava {
	constructor() {
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			if (message["type"] === 'requestStravaCredentials') {
				this.requestStravaCredentials().then(credentials => sendResponse(credentials));
			}
			if (message["type"] === 'clearStravaCredentials') {
				this.clearStravaCredentials().then(() => sendResponse(true));
			}
		});
	}

	async setStravaDefaults() {
		const { enableStrava } = await chrome.storage.local.get('enableStrava');
		if (enableStrava === undefined) {
			await chrome.storage.local.set({
				enableStrava: true
			});
		}
		const { stravaColor } = await chrome.storage.local.get('stravaColor');
		if (stravaColor === undefined) {
			await chrome.storage.local.set({
				stravaColor: 'hot'
			});
		}
		const { heatmapOpacity } = await chrome.storage.local.get('heatmapOpacity');
		if (heatmapOpacity === undefined) {
			await chrome.storage.local.set({
				heatmapOpacity: '100'
			});
		}
		const { maxZoomLevel } = await chrome.storage.local.get('maxZoomLevel');
		if (maxZoomLevel === undefined) {
			await chrome.storage.local.set({
				maxZoomLevel: '20'
			});
		}
	}

	clearStravaCookie(name) {
		return chrome.cookies.remove({ name, url: "https://www.strava.com/maps/global-heatmap" });
	}

	async getStravaCookie(name) {
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

	async clearStravaCredentials() {
		await this.clearStravaCookie('CloudFront-Key-Pair-Id');
		await this.clearStravaCookie('CloudFront-Policy');
		await this.clearStravaCookie('CloudFront-Signature');
	
		chrome.declarativeNetRequest.updateDynamicRules({
			removeRuleIds: [ 1 ]
		});
	
		const { enableStrava } = await chrome.storage.local.get('enableStrava');
		if (enableStrava) {
			chrome.action.setIcon({ path: "icons/rapid-strava-48.png" });
			chrome.action.setTitle({ title: "Log Into Strava"});
		} else {
			chrome.action.setIcon({ path: "icons/rapid-48.png" });
			chrome.action.setTitle({ title: "Start Mapping"});
		}
	}

	async requestStravaCredentials() {
		const keyPairId = await this.getStravaCookie('CloudFront-Key-Pair-Id');
		const policy    = await this.getStravaCookie('CloudFront-Policy');
		const signature = await this.getStravaCookie('CloudFront-Signature');
	
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
	
		const { enableStrava } = await chrome.storage.local.get('enableStrava');
		if (credentials === null && enableStrava) {
			chrome.action.setIcon({ path: "icons/rapid-strava-48.png" });
			chrome.action.setTitle({ title: "Log Into Strava"});
		} else {
			chrome.action.setIcon({ path: "icons/rapid-48.png" });
			chrome.action.setTitle({ title: "Start Mapping"});
		}
		return credentials;
	}
}