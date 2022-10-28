const url = 'https://tv.2ch.hk/r/random';

//const container = document.querySelector('.container');

const badgeUpdate = (badgeNum) => {
  chrome.action.setBadgeText({
    text: String(badgeNum),
  });
  chrome.action.setBadgeBackgroundColor({ color: '#880ED4' });
};

chrome.tabs.query({ title: 'random' }, (tabs) => {
  const tab = tabs[0];

  if (tab) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js'],
    });
  }
});

chrome.runtime.onMessage.addListener((rawMessage, _, response) => {
  const message = JSON.parse(rawMessage);

  if (message.identifier === 'id') {
    badgeUpdate(message.data);

    return;
  }

  popupUpdate(message.data);
});

const popupUpdate = (text) => {
  //container.innerHTML += `<p>${text}</p>`;
};
