const EMAIL_FAIL_URL = 'YOUR_LINK_MUST_BE_IN_QUOTES';
const EMAIL_TRUE_URL = 'YOUR_LINK_MUST_BE_IN_QUOTES';

let failEmails = new Set();
let trueEmails = new Set();

function loadRemoteEmailSet(url, label) {
    return new Promise((resolve) => {
        if (!url || url.includes('ВАША_ССЫЛКА')) {
            console.log(`Snov Colorizer: Пропущена загрузка ${label}, ссылка не указана.`);
            resolve(new Set());
            return;
        }

        chrome.runtime.sendMessage({ action: "fetchData", url: url }, response => {
            if (!response || !response.success) {
                console.error(`Snov Colorizer: Ошибка загрузки ${label}:`, response ? response.error : 'Неизвестная ошибка');
                resolve(new Set());
                return;
            }

            const result = new Set();
            const lines = response.data.split(/[\n,\r]/);

            for (let i = 0; i < lines.length; i++) {
                const cleanEmail = lines[i].trim().toLowerCase();
                if (cleanEmail && cleanEmail.includes('@')) {
                    result.add(cleanEmail);
                }
            }
            console.log(`Snov Colorizer: ${label} загружен - ${result.size} адресов.`);
            resolve(result);
        });
    });
}

Promise.all([
    loadRemoteEmailSet(EMAIL_FAIL_URL, 'Fail List'),
    loadRemoteEmailSet(EMAIL_TRUE_URL, 'True List')
]).then(([loadedFail, loadedTrue]) => {
    failEmails = loadedFail;
    trueEmails = loadedTrue;
    initObserver();
});

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
    observer.observe(document.body, { childList: true, subtree: true });
}