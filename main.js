var PROJECT_NAME = 'Autobell';
var DEBUG = true;
var NOTIFY_BTN_SELECTOR = '#notification-preference-toggle-button';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.subscribe === true) {
    log('Got message from background script: ' + JSON.stringify(request), 'debug');

    const btn = getNotificationButton();

    if (!btn) {
      log('Found no notification button, aborting', 'error');
      return;
    }

    if (!isNotificationsEnabled(btn)) {
      log('Notifications was OFF, turning ON', 'debug');
      btn.click();
    } else {
      log('Notifications was ON, doing nothing', 'debug');
    }
  }
});

function getNotificationButton() {
  const candidates = document.querySelectorAll(NOTIFY_BTN_SELECTOR);

  for (let el of candidates) {
    if (el.parentOffset !== null) {
      return el.firstChild;
    }
  }

  return null;
}

function log(msg, level = 'log') {
  if (!DEBUG && level === 'debug') return;
  console[level](PROJECT_NAME + ' ' + msg);
}

function isNotificationsEnabled(notifyBtn) {
  let node = notifyBtn;
  const max = 5;
  let l = 0;

  while (!node.hasAttribute('aria-pressed') && l++ < max) {
    if (!node.firstChild) {
      break; // No more nodes
    }

    node = node.firstChild;
  }

  if (node.getAttribute('aria-pressed') === 'true') {
    return true;
  }

  return false;
}
