const FETCH_TIMEOUT_MS = 10000;

/**
 * Fetches a remote URL and extracts email tokens.
 * @param {string} url
 * @returns {Promise<string[]>}
 */
function fetchParseCSV(url) {
    if (!url || !url.startsWith('http')) return Promise.resolve([]);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    return fetch(url, { signal: controller.signal })
        .then(response => {
            if (!response.ok) {
                console.warn(`[snov-addon] HTTP ${response.status} for ${url}`);
                return [];
            }
            return response.text().then(text => {
                const emails = [];
                const lines = text.split(/[\n,\r]/);
                for (let i = 0; i < lines.length; i++) {
                    const clean = lines[i].trim().toLowerCase();
                    if (clean && clean.includes('@')) {
                        emails.push(clean);
                    }
                }
                return emails;
            });
        })
        .catch(err => {
            if (err.name === 'AbortError') {
                console.warn(`[snov-addon] Fetch timeout for ${url}`);
            } else {
                console.error(`[snov-addon] Fetch error for ${url}:`, err);
            }
            return [];
        })
        .finally(() => clearTimeout(timer));
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'forceUpdate') {
        chrome.storage.local.get(['config'], (result) => {
            const config = result.config || {};

            Promise.all([
                fetchParseCSV(config.list1?.url),
                fetchParseCSV(config.list2?.url),
                fetchParseCSV(config.list3?.url),
                fetchParseCSV(config.list4?.url)
            ]).then(([e1, e2, e3, e4]) => {
                config.list1 = { ...config.list1, emails: e1 };
                config.list2 = { ...config.list2, emails: e2 };
                config.list3 = { ...config.list3, emails: e3 };
                config.list4 = { ...config.list4, emails: e4 };
                config.lastUpdate = new Date().toLocaleString();

                chrome.storage.local.set({ config }, () => {
                    // Notify all Snov.io tabs to reload their lists
                    chrome.tabs.query({ url: 'https://app.snov.io/*' }, tabs => {
                        tabs.forEach(tab => {
                            chrome.tabs.sendMessage(tab.id, { action: 'reloadLists' })
                                .catch(() => {}); // tab may not have content script yet
                        });
                    });

                    try {
                        sendResponse({ success: true, timestamp: config.lastUpdate });
                    } catch (e) {
                        // popup already closed — not an error
                    }
                });
            }).catch(err => {
                console.error('[snov-addon] forceUpdate failed:', err);
                try { sendResponse({ success: false }); } catch (e) {}
            });
        });

        return true; // keep message channel open
    }
});
