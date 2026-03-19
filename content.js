console.log('Snov Colorizer: Started');

const EMAIL_FAIL_FILE = chrome.runtime.getURL('email_fail.txt');
const EMAIL_TRUE_FILE = chrome.runtime.getURL('email_true.txt');
let failEmails = new Set();
let trueEmails = new Set();

/**
 * Loads a newline-delimited email list into a normalized set.
 *
 * @param {string} fileUrl The extension-local URL of the text file to fetch.
 * @param {string} label A human-readable label used in the success log message.
 * @returns {Promise<Set<string>>} A promise that resolves to a set of trimmed,
 * lowercase email addresses parsed from the fetched file.
 * @throws {TypeError} Throws when the fetch request fails or the response body
 * cannot be read as text.
 *
 * @example
 * loadEmailSet(chrome.runtime.getURL('email_true.txt'), 'email_true.txt')
 *   .then(emails => console.log(emails.has('user@example.com')));
 * // Expected output: true or false depending on file contents
 */
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

/**
 * Applies visual highlighting to unprocessed email elements on the page.
 *
 * Matching addresses from `trueEmails` receive a green badge-style treatment,
 * while matches from `failEmails` receive a red treatment. Every processed
 * element is marked with `data-colored="true"` to avoid duplicate work on
 * subsequent observer cycles.
 *
 * @returns {void} This function does not return a value.
 *
 * @example
 * highlightEmails();
 * // Expected result: matching `.long-email-width` elements are styled in-place
 */
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

/**
 * Starts observing the document for newly rendered email elements.
 *
 * The observer performs an immediate highlight pass and then debounces future
 * DOM mutation handling so repeated updates only trigger one refresh within a
 * 500-millisecond window.
 *
 * @returns {void} This function does not return a value.
 *
 * @example
 * initObserver();
 * // Expected result: existing and newly added email elements are highlighted
 */
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
