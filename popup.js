let statusTimer = null;
let isDirty = false; // tracks unsaved changes

/**
 * Shows a status message that auto-clears after a delay.
 * Clears any previous timer to prevent stacking.
 * @param {string} text
 * @param {string} [color]
 */
function showStatus(text, color = '#34a853') {
    const el = document.getElementById('statusMessage');
    el.textContent = text;
    el.style.color = color;

    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { el.textContent = ''; }, 3500);
}

/**
 * Marks the form as having unsaved changes.
 */
function markDirty() {
    isDirty = true;
    document.getElementById('saveBtn').style.fontWeight = 'bold';
    document.getElementById('saveBtn').style.outline = '2px solid #8C54FF';
}

/**
 * Clears the dirty flag after a successful save.
 */
function markClean() {
    isDirty = false;
    document.getElementById('saveBtn').style.fontWeight = '';
    document.getElementById('saveBtn').style.outline = '';
}

// ── Load saved config on popup open ──────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['config'], result => {
        const cfg = result.config || {};

        [1, 2, 3, 4].forEach(n => {
            const list = cfg[`list${n}`] || {};
            const defaults = ['#f65353', '#ffeb3b', '#7dff7d', '#53a8f6'];
            document.getElementById(`url${n}`).value = list.url || '';
            document.getElementById(`color${n}`).value = list.color || defaults[n - 1];
        });

        const lastUpdate = cfg.lastUpdate;
        document.getElementById('lastUpdate').textContent =
            lastUpdate ? `Last update: ${lastUpdate}` : 'No databases loaded';
    });

    // Track changes to any input or color picker
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', markDirty);
        input.addEventListener('change', markDirty);
    });
});

// ── Save Settings ─────────────────────────────────────────────────────────────

document.getElementById('saveBtn').addEventListener('click', () => {
    chrome.storage.local.get(['config'], result => {
        const config = result.config || {};
        const defaults = ['#f65353', '#ffeb3b', '#7dff7d', '#53a8f6'];

        [1, 2, 3, 4].forEach(n => {
            config[`list${n}`] = {
                ...config[`list${n}`],
                url: document.getElementById(`url${n}`).value.trim(),
                color: document.getElementById(`color${n}`).value || defaults[n - 1]
            };
        });

        chrome.storage.local.set({ config }, () => {
            markClean();
            showStatus('Settings saved. Click "Fetch" to reload data.');
        });
    });
});

// ── Fetch / Update Databases ──────────────────────────────────────────────────

document.getElementById('updateBtn').addEventListener('click', () => {
    if (isDirty) {
        showStatus('You have unsaved changes! Please save first.', '#ea4335');
        return;
    }

    const btn = document.getElementById('updateBtn');
    btn.disabled = true;
    btn.textContent = 'Fetching data…';

    // Guard: if background doesn't respond within 15s, restore the button
    const guard = setTimeout(() => {
        btn.disabled = false;
        btn.textContent = 'Fetch / Update Databases';
        showStatus('Timeout. Check URLs and try again.', '#ea4335');
    }, 15000);

    chrome.runtime.sendMessage({ action: 'forceUpdate' }, response => {
        clearTimeout(guard);
        btn.disabled = false;
        btn.textContent = 'Fetch / Update Databases';

        if (chrome.runtime.lastError) {
            showStatus('Extension error. Try reloading.', '#ea4335');
            return;
        }

        if (response?.success) {
            showStatus('Databases successfully updated!');
            document.getElementById('lastUpdate').textContent =
                `Last update: ${response.timestamp}`;
        } else {
            showStatus('Fetch error. Check the URLs.', '#ea4335');
        }
    });
});
