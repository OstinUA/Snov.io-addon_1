console.log('Snov Colorizer: Started');

const EMAIL_FAIL_FILE = chrome.runtime.getURL('email_fail.txt');
const EMAIL_TRUE_FILE = chrome.runtime.getURL('email_true.txt');
let failEmails = new Set();
let trueEmails = new Set();

function loadEmailSet(fileUrl, label) {
    return fetch(fileUrl)
        .then(r => r.text())
        .then(text => {
            const result = new Set();
            const lines = text.split('\n');

            for (let i = 0; i < lines.length; i++) {
                const cleanEmail = lines[i].trim().toLowerCase();
                if (cleanEmail) {
                    result.add(cleanEmail);
                }
            }

            console.log(`Snov Colorizer: Загружено ${result.size} почт в ${label}.`);
            return result;
        });
}

Promise.all([
    loadEmailSet(EMAIL_FAIL_FILE, 'email_fail.txt'),
    loadEmailSet(EMAIL_TRUE_FILE, 'email_true.txt')
])
    .then(([loadedFailEmails, loadedTrueEmails]) => {
        failEmails = loadedFailEmails;
        trueEmails = loadedTrueEmails;
        initObserver();
    })
    .catch(err => console.error('Ошибка чтения email-файлов:', err));

function highlightEmails() {
    const elements = document.querySelectorAll('.long-email-width:not([data-colored="true"])');

    if (elements.length === 0) return;

    elements.forEach(el => {
        const emailText = el.textContent.trim().toLowerCase();

        if (trueEmails.has(emailText)) {
            el.style.backgroundColor = '#7dff7d';
            el.style.color = '#000000';
            el.style.fontWeight = 'bold';
            el.style.padding = '2px 5px';
            el.style.borderRadius = '4px';
        } else if (failEmails.has(emailText)) {
            el.style.backgroundColor = '#f65353';
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

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}
