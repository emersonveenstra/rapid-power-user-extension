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


// generate iD imagery attributes for given Strava Heatmap type and color
function resolveStravaHeatmapImagery(type, color) {
	return {
	  id: `StravaHeatmap${type}`,
	  name: `Strava Heatmap (${type})`,
	  description: `The Strava Heatmap (${type}) shows heat made by aggregated, public activities over the last year.`,
	  template: `https://heatmap-external-{switch:a,b,c}.strava.com/tiles/${type.toLowerCase()}/${color.toLowerCase()}/{zoom}/{x}/{y}.png?v=19`,
	  terms_url: "https://wiki.openstreetmap.org/wiki/Strava#Data_Permission_-_Allowed_for_tracing!",
	  zoomExtent: [0, 15],
	  overlay: true,
	  alpha: 0.5
	};
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
		.then(data => [
		  ...data,
		  resolveStravaHeatmapImagery('Ride', 'Hot'),
		  resolveStravaHeatmapImagery('Run', 'Hot'),
		  resolveStravaHeatmapImagery('Water', 'Hot'),
		  resolveStravaHeatmapImagery('Winter', 'Hot'),
		  resolveStravaHeatmapImagery('All', 'Hot'),
		]);
  
	  response.json = json;
	}
	return response;
  };