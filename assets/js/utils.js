// https://developer.chrome.com/docs/extensions/mv3/messaging/

/**
 *
 * @param {func} injectScript script chèn vào console
 * @returns void
 * @description Thêm script từ hàm injectScript vào tab đang hoạt động.
 *
 */

export const injectScriptActiveTab = (injectScript) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];

    chrome.scripting
      .executeScript({
        target: { tabId: tab.id },
        func: injectScript,
      })
      .then(() => console.log('Injected!'));
  });
};
