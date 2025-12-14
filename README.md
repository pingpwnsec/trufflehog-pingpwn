# trugglehog-pingpwn

Browser extension to help locate potential exposed secrets (API keys, tokens, private keys) on web pages and referenced resources. This fork is prepared for public release and performs detection locally in the browser. No findings are sent to any remote server.

## Features
- Detects common secret patterns (API keys, tokens, private keys, webhook URLs) in page content and fetched resources.
- Highlights and lists findings for the current origin.
- Option to check for `.env` files and `.git` directories (may trigger network security protections).

## Privacy & Data Handling
- This extension performs all scanning and detection locally inside the browser. It does not transmit findings to remote servers.
- The extension uses `chrome.storage.sync` to save user toggles and local findings. You can clear stored findings using the popup UI.

## Permissions (required)
- `activeTab`, `tabs`: to query and message the active tab for UI notifications.
- `storage`: to persist user settings and findings.
- `scripting`: to inject content scripts.
- `notifications`: to show local notifications.
- `host_permissions`: `http(s)://*/*` — required to fetch referenced resources for detection across pages.

## Installing locally (developer/test)
1. Open `chrome://extensions/` in Chrome/Chromium.
2. Enable **Developer mode** (top-right).
3. Click **Load unpacked** and select this repository folder.

## Usage
1. Open the popup (extension action). Toggle detection rules on/off. By default detection is enabled for generic and specific patterns.
2. When a finding is detected for the active origin, a badge count appears and the finding list shows details.
3. Use the popup to clear findings for the origin or download a CSV of all findings.

## Notes and Recommendations
- Checking for `.env` files and `.git` directories can generate many server requests and may trigger WAFs or rate limits; use cautiously.
- If you want stricter privacy, consider narrowing host permissions before publishing; however, current broad host permissions are required for the extension's scanning functionality.

## License
This repository includes the original LICENSE included in the repository root.

## Contact
If you need changes to the public release copy or further privacy adjustments, open an issue or contact the maintainer at `pingpwnsec@gmail.com`.
