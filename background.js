function fetchParseCSV(url) {
    if (!url || !url.startsWith('http')) return Promise.resolve([]);
    
    return fetch(url)
        .then(response => response.text())
        .then(text => {
            const lines = text.split(/[\n,\r]/);
            const emails = [];
            for (let i = 0; i < lines.length; i++) {
                const clean = lines[i].trim().toLowerCase();
                if (clean && clean.includes('@')) {
                    emails.push(clean);
                }
            }
            return emails;
        })
        .catch(err => {
            console.error(`Fetch error for ${url}:`, err);
            return [];
        });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "forceUpdate") {
        chrome.storage.local.get(['config'], (result) => {
            const config = result.config || {};
            
            Promise.all([
                fetchParseCSV(config.list1?.url),
                fetchParseCSV(config.list2?.url),
                fetchParseCSV(config.list3?.url),
                fetchParseCSV(config.list4?.url)
            ]).then(([emails1, emails2, emails3, emails4]) => {
                
                config.list1 = { ...config.list1, emails: emails1 };
                config.list2 = { ...config.list2, emails: emails2 };
                config.list3 = { ...config.list3, emails: emails3 };
                config.list4 = { ...config.list4, emails: emails4 };
                config.lastUpdate = new Date().toLocaleString();

                chrome.storage.local.set({ config }, () => {
                    sendResponse({ success: true, timestamp: config.lastUpdate });
                });
            });
        });
        return true;
    }
});