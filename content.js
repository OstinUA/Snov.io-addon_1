let listsData = [];

chrome.storage.local.get(['config'], (result) => {
    const config = result.config;
    
    if (config) {
        if (config.list1 && config.list1.emails) listsData.push({ emails: new Set(config.list1.emails), color: config.list1.color });
        if (config.list2 && config.list2.emails) listsData.push({ emails: new Set(config.list2.emails), color: config.list2.color });
        if (config.list3 && config.list3.emails) listsData.push({ emails: new Set(config.list3.emails), color: config.list3.color });
        if (config.list4 && config.list4.emails) listsData.push({ emails: new Set(config.list4.emails), color: config.list4.color });
    }

    initObserver();
});

function highlightEmails() {
    const elements = document.querySelectorAll('.long-email-width:not([data-colored="true"])');
    if (elements.length === 0) return;

    elements.forEach(el => {
        const emailText = el.textContent.trim().toLowerCase();
        let matchedColor = null;

        for (let i = 0; i < listsData.length; i++) {
            if (listsData[i].emails && listsData[i].emails.has(emailText)) {
                matchedColor = listsData[i].color;
                break; 
            }
        }

        if (matchedColor) {
            el.style.backgroundColor = matchedColor;
            el.style.color = '#000000';
            el.style.fontWeight = 'bold';
            el.style.padding = '2px 5px';
            el.style.borderRadius = '4px';
        }
        
        el.dataset.colored = 'true';
    });
}

function initObserver() {
    highlightEmails();
    let timeout;
    const observer = new MutationObserver(() => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            highlightEmails();
        }, 500);
    });
    observer.observe(document.body, { childList: true, subtree: true });
}