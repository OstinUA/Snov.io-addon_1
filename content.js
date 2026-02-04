console.log('Snov Colorizer: Started');

const EMAIL_FILE = chrome.runtime.getURL('emails.txt');
let targetEmails = new Set();

// 1. Загрузка файла
fetch(EMAIL_FILE)
    .then(r => r.text())
    .then(text => {
        const lines = text.split('\n');
        // Заполняем Set (работает молниеносно даже на 50к+ строк)
        for (let i = 0; i < lines.length; i++) {
            const cleanEmail = lines[i].trim().toLowerCase();
            if (cleanEmail) {
                targetEmails.add(cleanEmail);
            }
        }
        console.log(`Snov Colorizer: Загружено ${targetEmails.size} почт для поиска.`);

        // Запускаем наблюдение только после загрузки базы
        initObserver();
    })
    .catch(err => console.error('Ошибка чтения файла emails.txt:', err));

// 2. Основная функция подсветки
function highlightEmails() {
    const elements = document.querySelectorAll('.long-email-width:not([data-colored="true"])');

    if (elements.length === 0) return;

    elements.forEach(el => {

        const emailText = el.textContent.trim().toLowerCase();

        if (targetEmails.has(emailText)) {
            el.style.backgroundColor = '#f65353'; // Красный фон
            el.style.color = '#000000';           // Черный текст
            el.style.fontWeight = 'bold';         // Жирный шрифт
            el.style.padding = '2px 5px';         // Отступы
            el.style.borderRadius = '4px';        // Скругление

            el.dataset.colored = "true";
        } else {

            el.dataset.colored = "true";
        }
    });
}

function initObserver() {
    highlightEmails();

    let timeout;
    const observer = new MutationObserver((mutations) => {
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