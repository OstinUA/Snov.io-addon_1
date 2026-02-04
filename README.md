# Snov.io Addon: Blocklist Highlighter

A specialized Chrome Extension designed to protect domain reputation for AdTech professionals using Snov.io. This tool integrates directly into the Snov.io web interface to visually flag specific email addresses (e.g., known bounces, delivery failures, or blacklisted contacts) in real-time.

## 🔗 Related Projects

This tool is part of the **AdTech Automation Suite**. Check out the companion extension:

| Project | Type | Description |
| :--- | :--- | :--- |
| **[Snov.io Addon: Click-to-Compose](https://github.com/OstinUA/Snov.io-addon_2)** | Chrome Extension | Instantly converts static email text into clickable `mailto:` links |
| **[Snov.io Addon: Blocklist Highlighter](https://github.com/OstinUA/Snov.io-addon_1)** | Chrome Extension | Real-time visual flagging of blacklisted or bounced emails |

## Overview

When managing large outreach campaigns, identifying previously failed or problematic emails within a new prospect list is critical. This extension loads a local database of problematic emails and uses a `MutationObserver` to scan the Snov.io DOM. When a matching email is detected, it is instantly highlighted in red, alerting the user to avoid sending emails to that address.

## Key Features

* **Real-time DOM Monitoring**: Utilizes `MutationObserver` to detect email addresses even on dynamic, single-page application (SPA) loads within Snov.io.
* **High-Performance Matching**: Uses efficient data structures to handle large blocklists with minimal UI latency.
* **Visual Alerts**: Automatically applies high-contrast styling (Red background, Bold text) to flagged emails.
* **Local Data Control**: The blocklist is managed via a local `emails.txt` file, ensuring data privacy and easy updates without requiring a backend server.

## Technical Details

* **Manifest V3**: Built on the modern Chrome Extension manifest standard.
* **Scope**: Restricted to `https://app.snov.io/*` to ensure security and performance.
* **Execution**: Scripts run at `document_end` to ensure the page structure is ready before observation begins.

## Installation

Since this tool utilizes a local blocklist file, it is installed via Chrome Developer Mode:

1.  **Clone the Repository**:
    ```bash
    git clone [https://github.com/OstinUA/Snov.io-addon_1.git](https://github.com/OstinUA/Snov.io-addon_1.git)
    ```
2.  **Configure Blocklist**:
    * Open the `emails.txt` file in the root directory.
    * Paste the list of emails you wish to flag (one email per line).
    * Save the file.
3.  **Load into Chrome**:
    * Navigate to `chrome://extensions/`.
    * Enable **Developer mode** (top right toggle).
    * Click **Load unpacked**.
    * Select the repository folder.
