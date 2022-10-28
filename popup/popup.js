const COPIED_TO_CLIPBOARD_ID = 'copied';
const SKIP_VIDEO_ID = 'skip';
const CLEARED_LIST_ID = 'cleared_list';

const btnTypeReducer = (type = 'SKIP') => {
  if (type === 'SKIP') {
    return '../assets/skip_16.png';
  }
};

const createListElement = (text, className = '', elementType = 'li') => {
  const element = document.createElement(elementType);
  element.innerText = text;

  element.className = className;

  if (elementType === 'li') {
    element.onclick = () => {
      navigator.clipboard.writeText(text).then(() => {
        chrome.runtime.sendMessage({
          action: COPIED_TO_CLIPBOARD_ID,
        });
      });
    };
  }

  return element;
};

const createBtn = (type, cb) => {
  const iconPath = btnTypeReducer(type);
  const btn = document.createElement('button');

  btn.onclick = (e) => {
    e.stopPropagation();
    cb?.();
  };

  const icon = document.createElement('img');
  icon.className = 'item__ico';

  icon.src = iconPath;

  btn.append(icon);

  return btn;
};

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.container');
  const clear_btn = document.getElementById('clear_btn');

  clear_btn.onclick = () => {
    console.log('remove');
    chrome.storage.sync.clear();
    chrome.storage.local.clear();
    chrome.storage.session.clear();

    location.reload();

    chrome.runtime.sendMessage({
      action: CLEARED_LIST_ID,
    });
  };

  chrome.notifications.clear(COPIED_TO_CLIPBOARD_ID);

  chrome.action.setBadgeText({
    text: '',
  });

  chrome.storage.local.get('videoState').then((response) => {
    if (Object.keys(response).length) {
      const { videoState } = response;
      const arr = JSON.parse(videoState);

      arr.forEach((item, index) => {
        const { title } = item;
        const pElement = createListElement(title);

        if (index === arr.length - 1) {
          const btn = createBtn('SKIP', () => {
            chrome.storage.local.set({ action: SKIP_VIDEO_ID });
          });
          pElement.insertAdjacentElement('beforeend', btn);
        }

        container.insertAdjacentElement('afterbegin', pElement);
      });

      return;
    }

    const pElement = createListElement(
      'There is no titles to show',
      'list__article',
      'p',
    );
    container.insertAdjacentElement('beforeend', pElement);
  });
});
