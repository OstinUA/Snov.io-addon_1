document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['config'], (result) => {
    const config = result.config || {
      list1: { url: '', color: '#f65353', emails: [] },
      list2: { url: '', color: '#ffeb3b', emails: [] },
      list3: { url: '', color: '#7dff7d', emails: [] },
      list4: { url: '', color: '#53a8f6', emails: [] },
      lastUpdate: null
    };
    
    document.getElementById('url1').value = config.list1.url || '';
    document.getElementById('color1').value = config.list1.color || '#f65353';
    document.getElementById('url2').value = config.list2.url || '';
    document.getElementById('color2').value = config.list2.color || '#ffeb3b';
    document.getElementById('url3').value = config.list3.url || '';
    document.getElementById('color3').value = config.list3.color || '#7dff7d';
    document.getElementById('url4').value = config.list4.url || '';
    document.getElementById('color4').value = config.list4.color || '#53a8f6';

    if (config.lastUpdate) {
      document.getElementById('lastUpdate').textContent = `Last update: ${config.lastUpdate}`;
    }
  });
});

function showStatus(text, color = '#34a853') {
  const status = document.getElementById('statusMessage');
  status.textContent = text;
  status.style.color = color;
  setTimeout(() => { status.textContent = ''; }, 3500);
}

document.getElementById('saveBtn').addEventListener('click', () => {
  chrome.storage.local.get(['config'], (result) => {
    const config = result.config || {};
    config.list1 = { ...config.list1, url: document.getElementById('url1').value.trim(), color: document.getElementById('color1').value };
    config.list2 = { ...config.list2, url: document.getElementById('url2').value.trim(), color: document.getElementById('color2').value };
    config.list3 = { ...config.list3, url: document.getElementById('url3').value.trim(), color: document.getElementById('color3').value };
    config.list4 = { ...config.list4, url: document.getElementById('url4').value.trim(), color: document.getElementById('color4').value };
    
    chrome.storage.local.set({ config }, () => {
      showStatus('Settings saved. Please fetch databases.');
    });
  });
});

document.getElementById('updateBtn').addEventListener('click', () => {
  const btn = document.getElementById('updateBtn');
  btn.disabled = true;
  btn.textContent = 'Fetching data...';
  
  chrome.runtime.sendMessage({ action: "forceUpdate" }, (response) => {
    btn.disabled = false;
    btn.textContent = 'Fetch / Update Databases';
    
    if (response && response.success) {
      showStatus('Databases successfully updated!');
      document.getElementById('lastUpdate').textContent = `Last update: ${response.timestamp}`;
    } else {
      showStatus('Fetch error. Please check the URLs.', '#ea4335');
    }
  });
});