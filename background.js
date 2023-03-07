const COPIED_TO_CLIPBOARD_ID = 'copied';
const CLEARED_LIST_ID = 'cleared_list';
const SKIP_VIDEO_ID = 'skiped';

const STORAGE_ACTIONS = {
  VIDEO_TITLE_UPDATE: 'VIDEO_TITLE_UPDATE',
};

const reducer = async (action = '', data) => {
  if (action === STORAGE_ACTIONS.VIDEO_TITLE_UPDATE && data.newValue) {
    const localObj = await chrome.storage.local.get('videoState');

    const videoState = Object.keys(localObj).length
      ? JSON.parse(localObj['videoState'])
      : [];

    videoState.push(data.newValue);

    chrome.storage.local.set({
      videoState: JSON.stringify(videoState),
    });

    const badgeCounterObj = await chrome.storage.local.get('badgeCounter');
    const updatedBadgeCouter =
      badgeCounterObj.badgeCounter >= 99
        ? 99
        : badgeCounterObj.badgeCounter + 1 || 1;

    chrome.action.setBadgeText({
      text: String(updatedBadgeCouter),
    });

    chrome.action.setBadgeBackgroundColor({ color: '#880ED4' });

    await chrome.storage.local.set({
      badgeCounter: updatedBadgeCouter,
    });
  }

  return Promise.resolve(true);
};

chrome.runtime.onInstalled.addListener(() => {
  console.log('installed');

  chrome.storage.sync.clear();
  chrome.storage.local.clear();
  chrome.storage.session.clear();
});

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
        chrome.storage.local.set({
          badgeCounter: 0,
        });
        setTimeout(() => {
          chrome.notifications.clear(noteId);
        }, 3000);
      },
    );
  }
});

chrome.storage.sync.onChanged.addListener(async (change) => {
  const actionObj = await chrome.storage.sync.get('action');
  await reducer(actionObj.action, change.data);
});
