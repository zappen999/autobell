const filter = {
  urls: [
    "*://*.youtube.com/service_ajax?name=subscribeEndpoint"
  ]
};

// Listen to subscribe request
chrome.webRequest.onCompleted.addListener(function(details) {
  // Get the current tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    // Send message from background script
    chrome.tabs.sendMessage(tabs[0].id, {subscribe: true}, function(response) {
    });
  });
}, filter);
