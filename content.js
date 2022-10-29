const id = 'currenttitle';
const spikBtnId = 'voteskip';
const SKIP_VIDEO_ID = 'skip';

const STORAGE_ACTIONS = {
  VIDEO_TITLE_UPDATE: 'VIDEO_TITLE_UPDATE',
};

const CONSTANTS = {
  skipTitle: {
    'https://tv.2ch.hk/r/*': 'Currently Playing',
    'https://cytu.be/r/': 'Сейчас: ',
  },
};

const manifest = chrome.runtime.getManifest();

const currentUrl = location.href;

const urlKey = manifest.content_scripts[0].matches.find((el) =>
  new RegExp(el, 'g').test(currentUrl),
);

const includedTitleToSkip = CONSTANTS.skipTitle[urlKey];

window.onerror = (error) => {
  console.log('error: ', error);
};

document.addEventListener('DOMContentLoaded', () => {
  const videoTitle = document.getElementById(id);
  const skipBtn = document.getElementById(spikBtnId);

  chrome.storage.local.onChanged.addListener((change) => {
    if (change.action?.newValue === 'skip') {
      skipBtn.click();
      chrome.runtime.sendMessage({
        action: 'skiped',
      });
      chrome.storage.local.remove('action').then(() => {
        console.log('Action removed');
      });
    }
  });

  const titleChangeCb = async () => {
    if (videoTitle.innerHTML.includes(includedTitleToSkip)) {
      // first render is Currently Playing in title, we need second render with ru title
      return;
    }

    await chrome.storage.sync.set({
      action: STORAGE_ACTIONS.VIDEO_TITLE_UPDATE,
      data: {
        title: videoTitle.innerText
          .replace('Сейчас: ', '')
          .replace('Currently Playing: ', ''),
      },
    });

    console.log('VideoTitle was added to storage');
  };

  const observer = new MutationObserver(titleChangeCb);

  observer.observe(videoTitle, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  });
});
