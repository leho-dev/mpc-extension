// https://developer.chrome.com/docs/extensions/mv3/messaging/

import { _CAPYBARA, _CAPYBARA_DEFAULT } from './constant.js';

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
                func: injectScript
            })
            .then(() => console.log('Injected!'));
    });
};

export function debounce(func, timeout = 1000) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
}

export function removeVietnameseTones(str) {
    return str
        .normalize('NFD') // Chuẩn hóa chuỗi theo dạng chuẩn Unicode
        .replace(/[\u0300-\u036f]/g, '') // Loại bỏ các dấu tổ hợp
        .replace(/đ/g, 'd') // Thay thế chữ "đ"
        .replace(/Đ/g, 'D') // Thay thế chữ "Đ"
        .replace(/[^\w\s]/gi, '') // Loại bỏ các ký tự đặc biệt
        .toLowerCase(); // Chuyển tất cả thành chữ thường
}

// capybara
export function getCapybara() {
    return JSON.parse(localStorage.getItem(_CAPYBARA)) || _CAPYBARA_DEFAULT;
}

export function setCapybara(data) {
    localStorage.setItem(_CAPYBARA, JSON.stringify(data));
}

export function getCapybaraKey(key) {
    return getCapybara()[key];
}

export function setCapybaraKey(key, value) {
    const capybara = getCapybara();
    capybara[key] = value;
    setCapybara(capybara);
}

export function clearCapybara() {
    localStorage.removeItem(_CAPYBARA);
}
