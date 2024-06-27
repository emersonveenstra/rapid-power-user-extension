const script = document.createElement('script');
script.src = chrome.runtime.getURL('scripts/display-strava-imagery.js');
document.documentElement.appendChild(script);