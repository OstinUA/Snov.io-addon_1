let listsData = [];
let observerInstance = null;

/**
 * Loads config from storage and rebuilds listsData Sets.
 * @param {object} config
 */
function buildListsData(config) {
    listsData = [];
    if (!config) return;
    ['list1', 'list2', 'list3', 'list4'].forEach(key => {
        const entry = config[key];
        if (entry?.emails?.length) {
            listsData.push({ emails: new Set(entry.emails), color: entry.color });
        }
    });
}

/**
 * Applies highlight styles to a single email element.
 * @param {Element} el
 */
function processElement(el) {
    if (el.dataset.colored === 'true') return;
    el.dataset.colored = 'true'; // mark early to prevent double-processing

    const emailText = el.textContent.trim().toLowerCase();
    if (!emailText.includes('@')) return;

    for (let i = 0; i < listsData.length; i++) {
        if (listsData[i].emails.has(emailText)) {
            el.style.cssText += `
                background-color:${listsData[i].color};
                color:#000000;
                font-weight:bold;
                padding:2px 5px;
                border-radius:4px;
            `.replace(/\s+/g, ' ').trim();
            return;
        }
    }
}

/**
 * Scans the document for unprocessed email elements.
 * Used on initial load and after config reload.
 */
function highlightAll() {
    document.querySelectorAll('.long-email-width:not([data-colored="true"])')
        .forEach(processElement);
}

/**
 * Processes only newly added nodes from a MutationObserver batch.
 * Much cheaper than a full DOM scan on every mutation.
 * @param {MutationRecord[]} mutations
 */
function processMutations(mutations) {
    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
            if (node.nodeType !== Node.ELEMENT_NODE) continue;

            // Check the node itself
            if (node.matches?.('.long-email-width:not([data-colored="true"])')) {
                processElement(node);
            }
            // Check descendants
            node.querySelectorAll?.('.long-email-width:not([data-colored="true"])')
                .forEach(processElement);
        }
    }
}

/**
 * Starts (or restarts) the MutationObserver.
 */
function initObserver() {
    if (observerInstance) {
        observerInstance.disconnect();
    }

    // Prefer a stable container over document.body for lower overhead
    const root = document.querySelector('.contacts-list, .leads-table, main') || document.body;

    observerInstance = new MutationObserver(mutations => {
        processMutations(mutations);
    });

    observerInstance.observe(root, {
        childList: true,
        subtree: true
        // No characterData — we don't need text change events
    });
}

// ── Init ─────────────────────────────────────────────────────────────────────

chrome.storage.local.get(['config'], result => {
    buildListsData(result.config);
    highlightAll();
    initObserver();
});

// ── Live reload when background updates the databases ─────────────────────────

chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'reloadLists') {
        chrome.storage.local.get(['config'], result => {
            buildListsData(result.config);

            // Reset already-marked elements so they get re-evaluated
            document.querySelectorAll('.long-email-width[data-colored="true"]')
                .forEach(el => {
                    el.dataset.colored = '';
                    // Clear previous inline highlight
                    el.style.backgroundColor = '';
                    el.style.color = '';
                    el.style.fontWeight = '';
                    el.style.padding = '';
                    el.style.borderRadius = '';
                });

            highlightAll();
        });
    }
});
