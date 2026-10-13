// Opens the side panel when the toolbar icon is clicked.
// Clicking the icon also grants activeTab for that tab, which is what lets
// the panel read the job page without any broad host permissions.
const enablePanelOnClick = () =>
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});

chrome.runtime.onInstalled.addListener(enablePanelOnClick);
chrome.runtime.onStartup.addListener(enablePanelOnClick);
enablePanelOnClick();
