chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchData") {
        fetch(request.url)
            .then(response => response.text())
            .then(text => sendResponse({ success: true, data: text }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; 
    }
});