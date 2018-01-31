var PROJECT_NAME = 'Autobell';
var DEBUG = true;
var SUBSCRIBE_BTN_SELECTOR = '#subscribe-button paper-button';
var NOTIFY_BTN_SELECTOR = '#notification-button yt-icon-button';

function trackSubButton(callback) {
  let prevUrl = window.location.href, first = true;

  // XXX: please do not do like this. ever.
  setInterval(function() {
    let currUrl = window.location.href;
    const isNewPage = currUrl !== prevUrl;

    // we must have a new page, a valid page, or first timer to continue
    if (!((isNewPage && /\/(watch|channel|user)/.test(currUrl)) || first)) {
      return;
    }

    log('Valid subscribe URL detected', 'debug');

    const subBtns = document.querySelectorAll(SUBSCRIBE_BTN_SELECTOR);

    if (subBtns.length > 0) {
      first = false;
      prevUrl = currUrl;
      callback(subBtns[subBtns.length - 1]);
    }
  }, 100);
}

function log(msg, level = 'log') {
  if (!DEBUG && level === 'debug') return;
  console[level](PROJECT_NAME + ' ' + msg);
}

function getIsSubscribed(subBtn) {
  return subBtn.hasAttribute('subscribed');
}

function isNotificationsEnabled(notifyBtn) {
  return notifyBtn.getAttribute('aria-pressed') === 'true';
}

function onSubscribeClick(subBtn, cb) {
  // keep the correct state of subscription/no sub
  var observer = new MutationObserver(function(changes) {
    for (var change of changes) {
      if (change.type !== 'attributes') continue;

      if (change.attributeName === 'subscribed') {
        cb(getIsSubscribed(subBtn));
        break; // done for now
      }
    }
  });

  observer.observe(subBtn, {
    attributes: true,
    attributeFilter: ['subscribed'],
  });

  return observer;
}

function isParentChainVisible(el) {
  let curEl = el;

  while (curEl.parentNode) {
    if (curEl.hasAttribute('hidden')) {
      return false;
    }

    curEl = curEl.parentNode;
  }

  return true;
}

log('Init', 'debug');

let subBtnEl, subObserver;

trackSubButton(el => {
  subBtnEl = el;

  if (subObserver) {
    log('Disconnecting observer', 'debug');
    subObserver.disconnect();
  }

  log('Registering observer', 'debug');
  subObserver = onSubscribeClick(subBtnEl, isSubscribing => {
    log(isSubscribing ? 'Subscribing' : 'Unsubscribing', 'debug');

    if (!isSubscribing) {
      return;
    }

    const notifyBtns = Array.from(document.querySelectorAll(NOTIFY_BTN_SELECTOR));

    if (notifyBtns.length === 0) {
      log('Could not find any notification buttons', 'error');
      return;
    }

    // find the first notification button that has no hidden parent
    const candidates = notifyBtns
      .filter(candidate => isParentChainVisible(candidate));

    if (candidates.length !== 1) {
      log(`Found invalid number of notification button candidates ${candidates.length}`, 'error');
      return;
    }

    const notifyBtn = candidates[0];

    if (!isNotificationsEnabled(notifyBtn)) {
      log('ENABLING NOTIFICATIONS', 'debug');
      notifyBtn.click();
      return;
    }

    log('Notifications already turned on, doing nothing', 'debug');
  });
});
