/*************************************************

	BG.js
	------
	This code is executed on the BACKGROUND
	It runs in the context of the extension (not the page)
	Is fired when the extension loads and it's always running

	Communication
		* Background.js <-> Options.js via browser.storage.sync
		* Background.js <-> Tab.js via Message Passing 

*************************************************/

//————————————————————————————————————
// OPTIONS (AKA Config)
//————————————————————————————————————

let options;

function setDefaultOptions() {
  // Very first session ever running the extensions by the user
  options.enable_all = false;

  options.config_adjust_saturation = true;
  options.config_adjust_contrast = false;
  options.config_adjust_white_bg = false;
  options.config_adjust_video = false;

  options.config_img_bg_type = "stripes-50";
  options.config_img_bg_use_stripes = true;
  options.config_img_bg_opacity = 50;

  browser.storage.sync.set({ options });
}

function loadOptions(callback) {
  browser.storage.sync.get("options").then((data) => {
    options = data.options || {};
    if (!data.options) {
      setDefaultOptions();
    }
    if (callback) callback();
  });
}

//------------------------------------------------
// UI [T] Button
//------------------------------------------------
browser.browserAction.onClicked.addListener((tab) => {
  toggleIsEnableAll();
  updateUI();
  refreshTab(tab.id);
});

function updateUI() {
  getIsEnableAll((isEnabled) => {
    const iconCurr = isEnabled
      ? {
          16: browser.runtime.getURL("imgs/icon/icon-ON@16px.png"),
          32: browser.runtime.getURL("imgs/icon/icon-ON@32px.png"),
        }
      : {
          16: browser.runtime.getURL("imgs/icon/icon-OFF@16px.png"),
          32: browser.runtime.getURL("imgs/icon/icon-OFF@32px.png"),
        };

    browser.browserAction.setIcon({ path: iconCurr });
  });
}

//------------------------------------------------
// Refresh TAB
//------------------------------------------------
function refreshTab(tabId) {
  browser.tabs.reload(tabId);
}

//------------------------------------------------
// ENABLE / DISABLE Mode
//------------------------------------------------
function getIsEnableAll(callback) {
  browser.storage.sync.get("options").then((data) => {
    options = data.options || {};
    callback(options.enable_all === true);
  });
}

function setIsEnableAll(enable, callback) {
  browser.storage.sync.get("options").then((data) => {
    options = data.options || {};
    options.enable_all = enable;
    browser.storage.sync.set({ options }).then(() => {
      callback(enable);
    });
  });
}

function toggleIsEnableAll() {
  getIsEnableAll((isEnabled) => {
    setIsEnableAll(!isEnabled, (isEnabled) => {
      setListeners();
      updateUI();
    });
  });
}

// ————————————————————————————————————
// Listen to calls from tab.js
// Calls:
// 	- getMode()
//
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method === "getMode") {
    browser.storage.sync.get("options").then((data) => {
      options = data.options || {};
      const response = {
        enableAll: options.enable_all === true,
        config_adjust_saturation: options.config_adjust_saturation === true,
        config_adjust_contrast: options.config_adjust_contrast === true,
        config_adjust_white_bg: options.config_adjust_white_bg === true,
        config_adjust_video: options.config_adjust_video === true,
        // ---
        config_img_bg_type: options.config_img_bg_type || 1,
        config_img_bg_opacity: options.config_img_bg_opacity || 50,
        config_img_bg_use_stripes: options.config_img_bg_use_stripes || false,
      };
      sendResponse(response);
    });
    return true; // Keeps the message channel open for sendResponse.
  }

  if (request.refresh === "true") {
    setListeners();
    updateUI();
  }
  return true;
});

//------------------------------------------------
// BLOCKING RULES
// Prevent loading of image and video assets
//------------------------------------------------
function setListeners() {
  getIsEnableAll((isEnabled) => {
    if (isEnabled) {
      applyBlockingRules();
    } else {
      removeBlockingRules();
    }
  });
}

const imageReplacement = browser.runtime.getURL("imgs/bg/bg_blank_1px.png");

function applyBlockingRules() {
  let elementsToBlock = options.config_adjust_video
    ? ["image", "object", "media"]
    : ["image", "object"];

  // Remove existing listener if any
  if (browser.webRequest.onBeforeRequest.hasListener(blockingListener)) {
    browser.webRequest.onBeforeRequest.removeListener(blockingListener);
  }

  // Add new blocking listener
  browser.webRequest.onBeforeRequest.addListener(
    blockingListener,
    {
      urls: ["<all_urls>"],
      types: elementsToBlock
    },
    ["blocking"]
  );
}

function removeBlockingRules() {
  if (browser.webRequest.onBeforeRequest.hasListener(blockingListener)) {
    browser.webRequest.onBeforeRequest.removeListener(blockingListener);
  }
}

function blockingListener(details) {
  return {
    redirectUrl: imageReplacement
  };
}

// ————————————————————————————————————
// Initialize
loadOptions(() => {
  setListeners();
  updateUI();
});
