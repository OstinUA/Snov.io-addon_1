# Snov.io Addon: Status Highlighter

Fast, zero-backend Chrome extension for Snov.io that color-codes email statuses in real time, so your outreach ops can instantly spot hard fails and replied leads.

![Version](https://img.shields.io/badge/version-1.0.5-blue?style=flat-square)
![Build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)
![Coverage](https://img.shields.io/badge/coverage-n%2Fa-lightgrey?style=flat-square)
![License](https://img.shields.io/badge/license-GPL--2.0-blue?style=flat-square)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Community and Support](#community-and-support)
- [License](#license)
- [Contacts](#contacts)

## Features

- Dual status lists with separate semantics:
  - `email_fail.txt` -> failed/deliverability-risk contacts (red highlight)
  - `email_true.txt` -> replied contacts (green highlight)
- Real-time DOM tracking with `MutationObserver` for dynamic Snov.io pages.
- O(1) lookup behavior via `Set`-based matching for large lists.
- Lightweight architecture with no API calls, no backend, and no telemetry.
- Predictable precedence: reply status wins if an email appears in both lists.

## Tech Stack

- JavaScript (Vanilla ES6) for content script logic
- Chrome Extension Manifest V3
- Native browser APIs: `fetch`, `MutationObserver`, DOM selectors
- Plain text data sources (`.txt`) for status lists

## Project Structure

```text
.
├── content.js         # Core matching + highlighting logic
├── manifest.json      # Extension manifest and resource permissions
├── email_fail.txt     # Failed email list (red)
├── email_true.txt     # Replied email list (green)
├── icons/
│   └── icon128.png
├── README.md
└── LICENSE
```

## Getting Started

### Prerequisites

- Google Chrome (or Chromium-based browser with extension support)
- Access to `https://app.snov.io/*`
- Local clone of this repository

### Installation

```bash
# 1) Clone the repo
git clone https://github.com/OstinUA/Snov.io-addon_1.git
cd Snov.io-addon_1

# 2) Fill status lists (one email per line)
# edit email_fail.txt and email_true.txt in your editor

# 3) Load extension in Chrome
# open chrome://extensions/
# enable Developer mode
# click "Load unpacked" and select this project directory
```

## Usage

```text
# Workflow in production:
1) Add failed addresses to email_fail.txt
2) Add replied addresses to email_true.txt
3) Reload the extension in chrome://extensions/
4) Open or refresh https://app.snov.io/

# Visual result:
- Red badge: failed/risky address
- Green badge: replied address
```

## Configuration

- `email_fail.txt`: newline-delimited fail-list.
- `email_true.txt`: newline-delimited replied-list.
- Matching is case-insensitive (`trim().toLowerCase()`).
- Runtime scope is limited to `https://app.snov.io/*` via `manifest.json`.
- Both `.txt` files must stay in repo root so `chrome.runtime.getURL(...)` can fetch them.

## Community and Support

If this extension saves you time in outbound workflows, drop a star and share feedback via issues or direct channels below.

## License

This project is distributed under the GNU GPL v2. See `LICENSE` for details.

## Contacts

## ❤️ Support the Project

If you find this tool useful, consider leaving a ⭐ on GitHub or supporting the author directly:

[![Patreon](https://img.shields.io/badge/Patreon-OstinFCT-f96854?style=flat-square&logo=patreon)](https://www.patreon.com/OstinFCT)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-fctostin-29abe0?style=flat-square&logo=ko-fi)](https://ko-fi.com/fctostin)
[![Boosty](https://img.shields.io/badge/Boosty-Support-f15f2c?style=flat-square)](https://boosty.to/ostinfct)
[![YouTube](https://img.shields.io/badge/YouTube-FCT--Ostin-red?style=flat-square&logo=youtube)](https://www.youtube.com/@FCT-Ostin)
[![Telegram](https://img.shields.io/badge/Telegram-FCTostin-2ca5e0?style=flat-square&logo=telegram)](https://t.me/FCTostin)
