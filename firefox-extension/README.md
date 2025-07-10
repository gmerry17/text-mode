# Text Mode - Firefox Extension

This is the Firefox version of the Text Mode extension, converted from the Chrome extension.

## Key Differences from Chrome Version

### API Changes
- **Namespace**: Changed from `chrome.*` to `browser.*` APIs
- **Promises**: Uses Promise-based APIs instead of callback-based APIs
- **Background Scripts**: Uses traditional background scripts instead of service workers
- **Web Request Blocking**: Uses `webRequest` API instead of `declarativeNetRequest`

### Manifest Changes
- **Manifest Version**: Uses Manifest V2 (better compatibility with Firefox)
- **Addon ID**: Includes explicit `applications.gecko.id` for storage API compatibility
- **Browser Action**: Uses `browser_action` instead of `action`
- **Options UI**: Uses `options_ui` instead of `options_page`
- **Permissions**: Uses `webRequest` and `webRequestBlocking` permissions
- **Background**: Uses `scripts` array instead of `service_worker`

### Technical Changes
- Background script uses `browser.webRequest.onBeforeRequest` for image blocking
- All storage operations use Promise-based syntax
- Message passing uses Promise-based `browser.runtime.sendMessage()`

## Installation

### Development Installation
1. Open Firefox
2. Navigate to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file from this `firefox-extension` folder

**Note**: The addon includes an explicit ID (`text-mode@example.com`) to enable storage API functionality during development. For production, you should use a unique domain you control.

### For Distribution
1. Zip the contents of the `firefox-extension` folder (not the folder itself)
2. Submit to Firefox Add-ons (AMO) for review

## Features

The Firefox extension maintains all the same features as the Chrome version:

- **Text Mode Toggle**: Click the toolbar button to enable/disable text mode
- **Image Replacement**: Replace images with customizable patterns (stripes or solid colors)
- **Video Blocking**: Option to disable video content
- **Color Adjustments**: Desaturation and contrast controls
- **Background Customization**: Various opacity levels and pattern options

## Browser Compatibility

- Firefox 55+ (for WebExtensions API support)
- Firefox for Android (limited testing)

## Known Limitations

- Some advanced declarativeNetRequest features from Chrome are implemented differently
- Background script is persistent (may use slightly more memory than Chrome's service worker approach)

## Development Notes

If you're modifying this extension:

1. All `chrome.*` APIs have been replaced with `browser.*`
2. Callback-based APIs have been converted to Promise-based
3. The background script structure is different from Chrome's service worker
4. Web request blocking uses the older but more compatible webRequest API

## File Structure

```
firefox-extension/
├── manifest.json          # Firefox-specific manifest
├── js/
│   ├── background.js      # Background script (not service worker)
│   ├── tab.js            # Content script
│   └── options.js        # Options page script
├── html/
│   └── options.html      # Options page
├── css/
│   ├── tab.css          # Content script styles
│   └── options.css      # Options page styles
├── icons/               # Extension icons
└── imgs/               # Image resources
```
