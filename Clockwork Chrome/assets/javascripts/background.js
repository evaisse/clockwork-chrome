function onMessage(message, sender, callback) {
	if (message.action == 'getJSON') {
		var xhr = new XMLHttpRequest();

		xhr.open('GET', message.url, true);

		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					try {
						callback(JSON.parse(xhr.responseText));
					} catch (e) {
						console.log('Invalid Clockwork metadata:');
						console.log(xhr.responseText);
					}
				} else {
					console.log('Error getting Clockwork metadata:');
					console.log(xhr.responseText);
				}
			}
		}

		Object.keys(message.headers || {}).forEach(function(headerName) {
		    xhr.setRequestHeader(headerName, message.headers[headerName]);
		});

		xhr.send();
	} else if (message.action == 'getLastClockworkRequestInTab') {
		callback(lastClockworkRequestPerTab[message.tabId])
	}

	return true
}

chrome.runtime.onMessage.addListener(onMessage);

// track last clockwork-enabled request per tab
let lastClockworkRequestPerTab = {}

chrome.webRequest.onCompleted.addListener(
	(request) => {
		if (request.responseHeaders.find((x) => x.name.toLowerCase() == 'x-clockwork-id')) {
			lastClockworkRequestPerTab[request.tabId] = { url: request.url, headers: request.responseHeaders }
		}
	},
	{ urls: [ '<all_urls>' ], types: [ 'main_frame' ] },
	[ 'responseHeaders' ]
)

chrome.tabs.onRemoved.addListener((tabId) => delete lastClockworkRequestPerTab[tabId])
