const COPIED_TO_CLIPBOARD_ID = 'copied';
const CLEARED_LIST_ID = 'cleared_list';
const SKIP_VIDEO_ID = 'skiped';

// const content_matches = chrome.runtime.getManifest().content_scripts[0].matches;
// const urlRegexArr = content_matches.map((item) => new RegExp(item, 'ig'));

let badgeCounter = 0;

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === COPIED_TO_CLIPBOARD_ID) {
    chrome.notifications.create(
      COPIED_TO_CLIPBOARD_ID,
      {
        title: 'Note',
        type: 'basic',
        message: 'Title is copied',
        iconUrl: chrome.runtime.getURL('/assets/copy_128.png'),
      },
      (noteId) => {
        setTimeout(() => {
          chrome.notifications.clear(noteId);
        }, 3000);
      },
    );
  }

  if (message.action === SKIP_VIDEO_ID) {
    chrome.notifications.create(
      SKIP_VIDEO_ID,
      {
        title: 'Note',
        type: 'basic',
        message: 'Video is skiped',
        iconUrl: chrome.runtime.getURL('/assets/skip_128.png'),
      },
      (noteId) => {
        setTimeout(() => {
          chrome.notifications.clear(noteId);
        }, 3000);
      },
    );
  }

  if (message.action === CLEARED_LIST_ID) {
    chrome.notifications.create(
      CLEARED_LIST_ID,
      {
        title: 'Note',
        type: 'basic',
        message: 'List is cleared',
        iconUrl: chrome.runtime.getURL('/assets/remove_128.png'),
      },
      (noteId) => {
        badgeCounter = 0;
        setTimeout(() => {
          chrome.notifications.clear(noteId);
        }, 3000);
      },
    );
  }
});

const tabs = {};

chrome.tabs.onUpdated.addListener((tabId, _, tab) => {
  tabs[tabId] = tab.url;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  const url = tabs[tabId];

  /*
  if (urlRegexArr.some((item) => item.test(url))) {
    console.log('remove');
    chrome.storage.sync.clear();
    chrome.storage.local.clear();
    chrome.storage.session.clear();
  }
  */
});

const reducer = (action = '', data) => {
  if (action === 'VIDEO_TITLE_UPDATE') {
    if (data.newValue) {
      chrome.storage.local.get('videoState').then((obj) => {
        const videoState = Object.keys(obj).length
          ? JSON.parse(obj['videoState'])
          : [];

        videoState.push(data.newValue);

        chrome.storage.local.set({
          videoState: JSON.stringify(videoState),
        });

        chrome.action.setBadgeText({
          text: String(++badgeCounter),
        });
        chrome.action.setBadgeBackgroundColor({ color: '#880ED4' });
      });
    }
  }
};

chrome.storage.sync.onChanged.addListener((change) => {
  const action = change.action?.newValue || 'VIDEO_TITLE_UPDATE';
  reducer(action, change.data);
});
