var PROJECT_NAME = 'Autobell';
var DEBUG = false;
var SUBSCRIBE_BTN_SELECTOR = '#subscribe-button paper-button';
var NOTIFY_BTN_SELECTOR = '#notification-button #button';

// XXX: do not do this at home kids
function onWatchPageReady() {
  return new Promise(function(resolve) {
    var interval = setInterval(function() {
      var subBtn = document.querySelector(SUBSCRIBE_BTN_SELECTOR);
      if (subBtn) {
        clearInterval(interval);
        return resolve(subBtn);
      }
    }, 30);
  });
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

(async function() {
  log('Loaded!', 'debug');

  // wait for the page to load fully
  var subBtn = await onWatchPageReady();
  var notifyBtn = document.querySelector(NOTIFY_BTN_SELECTOR);

  var subscribeObserver = onSubscribeClick(subBtn, function(isSubscribing) {
    log(isSubscribing ? 'Subscribing' : 'Unsubscribing', 'debug');

    if (isSubscribing && !isNotificationsEnabled(notifyBtn)) {
      log('Enabling notifications', 'debug');
      notifyBtn.click();
    }
  });
})();
