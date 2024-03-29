import { injectScriptActiveTab } from './utils.js';
import { _IGNORE_SUBJECT_INIT, _URL_TIENICHSV } from './constant.js';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const getInitData = () => {
  const URL = window.location.href;
  let userId = 'NOT FOUND';
  let fullName = 'NOT FOUND';

  const loginElement = document.querySelectorAll('app-login table > tr');

  if (loginElement.length > 0) {
    userId = loginElement[0].querySelectorAll('td')[1].innerText.trim();
    fullName = loginElement[1].querySelectorAll('td')[1].innerText.trim();
  }

  (async () => {
    await chrome.runtime.sendMessage({
      type: 'INIT_URL',
      payload: { URL, userId, fullName },
    });
  })();
};

const getData = () => {
  const tableElement = document.querySelectorAll(
    'table#excel-table > tbody > tr.text-center.ng-star-inserted'
  );

  const data = Array.from(tableElement).map((d) => {
    const columns = d.querySelectorAll('td');
    return {
      code: columns[1].innerText,
      name: columns[3].innerText,
      credit: columns[4].innerText,
      point: columns[10].innerText,
    };
  });

  (async () => {
    await chrome.runtime.sendMessage({ type: 'GET_DATA', payload: { data } });
  })();
};

(() => {
  return {
    ignoreList: _IGNORE_SUBJECT_INIT,
    data: [],
    init() {
      injectScriptActiveTab(getInitData);
    },
    subscribe() {
      const notCorrectURL = () => {
        $('.root').classList.add('hide');
        $('.btn-import-data').classList.add('hide');
      };

      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        const { type, payload } = request;

        switch (type) {
          case 'INIT_URL':
            const { URL, userId, fullName } = payload;
            if (!URL) {
              notCorrectURL();
              $('.site-current').innerText = 'Lỗi không tìm thấy tab!';
              return;
            }

            if (!URL.includes(_URL_TIENICHSV)) {
              notCorrectURL();
              $('.site-current').innerHTML =
                'Vui lòng chuyển sang tienichsv.ou.edu.vn/#/diem';
              return;
            }

            $('.site-current').innerText = userId + ' - ' + fullName;
            return;

          case 'GET_DATA':
            const { data } = payload;

            const dataFiltered = data.filter((d) => {
              const isIgnore = this.ignoreList.find((i) => d.code.includes(i));
              if (!isIgnore) return true;
            });

            this.data = dataFiltered;
            this.render();
            return;
          default:
            console.log('No type match!');
            return;
        }
      });
    },
    render() {
      const tableHtmls = this.data
        .map((d, idx) => {
          return `
          <tr data-id=${idx} class="row-data">
            <td>${d.code}</td>
            <td>${d.name}</td>
            <td style="min-width: 20px;">${d.credit}</td>
            <td style="min-width: 20px;">${d.point}</td>
            <td data-id=${idx} class="delete" style="min-width: 20px;">x</td>
          </tr>
        `;
        })
        .join('');

      const ignoreListHtmls = this.ignoreList
        .map((ig) => `<b>${ig}</b>`)
        .join('; ');

      const totalCredit = this.data.reduce(
        (acc, curr) => acc + parseInt(curr.credit),
        0
      );

      const avg = this.data.reduce(
        (acc, curr) => {
          const point = parseFloat(curr.point);
          const credit = parseInt(curr.credit);

          if (isNaN(point) || isNaN(credit)) return acc;
          return {
            point: acc.point + point * credit,
            credit: acc.credit + credit,
          };
        },
        {
          point: 0,
          credit: 0,
        }
      );

      $('table.data').innerHTML = tableHtmls;
      $('.ignore-list > span').innerHTML = ignoreListHtmls;
      $('.total-credit span').innerText = totalCredit;
      $('.avg-point span').innerText = (avg.point / avg.credit).toFixed(4);
    },
    handle() {
      $('.btn-import-data').addEventListener('click', () =>
        injectScriptActiveTab(getData)
      );

      $('table.data').onclick = (e) => {
        const rowData = e.target.closest('.row-data');
        const deleteBtn = e.target.closest('.delete');

        if (rowData) {
          const id = rowData.dataset.id;
          const { code, name, credit, point } = this.data[id];

          $('input.code').value = code;
          $('input.name').value = name;
          $('input.credit').value = credit;
          $('input.point').value = point;
        }

        if (deleteBtn) {
          const id = deleteBtn.dataset.id;
          this.data.splice(id, 1);
          this.render();
        }
      };

      $('.form-subject').onsubmit = (e) => {
        e.preventDefault();

        const code = $('input.code').value.trim();
        const name = $('input.name').value.trim();
        const credit = $('input.credit').value.trim();
        const point = $('input.point').value.trim();

        const data = { code, name, credit, point };

        const isExist = this.data.find((d) => d.code == code);

        if (!isExist) this.data.unshift(data);
        else {
          const idx = this.data.findIndex((d) => d.code === code);
          this.data[idx] = data;
        }

        this.render();
      };
    },
    start() {
      this.subscribe();
      this.init();
      this.handle();
      this.render();
    },
  };
})().start();
