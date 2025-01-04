import {
  debounce,
  formatTime,
  getCapybara,
  injectScriptActiveTab,
  removeVietnameseTones,
  setCapybara
} from "./utils.js";
import { _ERROR_MESSAGE_TIMEOUT, _URL_TIENICHSV } from "./constant.js";

const $ = (selector) => document.querySelector(selector);
const _$$ = (selector) => document.querySelectorAll(selector);

const getTabURL = async () => {
  const URL = window.location.href;

  await chrome.runtime
    .sendMessage({
      type: "CHECK_URL",
      payload: { URL }
    })
    .then(() => console.info("Send message success!"))
    .catch((err) => console.error(err));
};

const getData = async () => {
  const loginElement = document.querySelectorAll("app-login table > tr");
  const tableRows = document.querySelectorAll(
    "table#excel-table > tbody > tr.table-primary.ng-star-inserted, table#excel-table > tbody > tr.text-center.ng-star-inserted"
  );

  let fullName = "";
  let userId = "";

  if (loginElement.length > 0) {
    userId = loginElement[0].querySelectorAll("td")[1].innerText.trim();
    fullName = loginElement[1].querySelectorAll("td")[1].innerText.trim();
  }

  const data = [];

  Array.from(tableRows).forEach((row, index) => {
    const columns = row.querySelectorAll("td");

    const isHead = row.classList.contains("table-primary");

    if (isHead) {
      data.push({
        id: index,
        title: columns[0].innerText,
        data: []
      });
    }

    if (!isHead) {
      data[data.length - 1].data.push({
        code: columns[1].innerText,
        name: columns[3].innerText,
        credit: parseFloat(columns[4].innerText) || 0,
        point: parseFloat(columns[10].innerText)
      });
    }
  });

  await chrome.runtime
    .sendMessage({ type: "GET_DATA", payload: { data, user: { userId, fullName } } })
    .then(() => console.info("Send message success!"))
    .catch((err) => console.error(err));
};

const setError = (message) => {
  $(".error-message").innerHTML = message;
  $(".error-message").classList.remove("hide");

  setTimeout(() => {
    $(".error-message").classList.add("hide");
  }, _ERROR_MESSAGE_TIMEOUT);
};

(() => {
  const capybara = getCapybara();

  return {
    fullName: capybara.fullName,
    userId: capybara.userId,
    ignoreList: capybara.ignoreList,
    updatedAt: capybara.updatedAt,
    data: capybara.data,
    queyText: capybara.queyText,
    isOnlyCalcGPA: capybara.isOnlyCalcGPA,
    subscribe() {
      chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
        const { type, payload } = request;

        switch (type) {
          case "CHECK_URL": {
            const { URL } = payload;

            const _URL_TIENICHSV_DIEM = _URL_TIENICHSV + "/#/diem";

            if (!URL) {
              setError("Không thể lấy URL của trang hiện tại!");
              return;
            }

            if (!URL.includes(_URL_TIENICHSV_DIEM)) {
              setError(`Vui lòng truy cập vào trang <b class="error-nav-link">${_URL_TIENICHSV_DIEM}</b> trước!`);
              return;
            }

            $(".root").classList.remove("hide");
            $(".btn-import-data").classList.remove("hide");
            return;
          }

          case "GET_DATA": {
            const { data, user } = payload;

            if (!data.length || !user.userId || !user.fullName) {
              return;
            }

            this.updateUser(user);
            this.updateData(data);
            this.updateTime();
            this.saveDataCurrent();
            $(".no-data").classList.add("hide");
            return;
          }
          default:
            console.error("No type match!");
            return;
        }
      });
    },
    saveDataCurrent() {
      setCapybara({
        fullName: this.fullName,
        userId: this.userId,
        ignoreList: this.ignoreList,
        updatedAt: this.updatedAt,
        data: this.data,
        queyText: this.queyText,
        isOnlyCalcGPA: this.isOnlyCalcGPA
      });
    },
    firstCheck() {
      if (this.userId && this.fullName && this.data) {
        $(".no-data").classList.add("hide");
        $(".btn-import-data").classList.remove("hide");
        $(".root").classList.remove("hide");
      } else {
        injectScriptActiveTab(getTabURL);
      }
    },
    updateUser(user) {
      this.fullName = user.fullName;
      this.userId = user.userId;
      this.renderUser();
    },
    updateData(data = this.data) {
      this.data = data;
      this.checkIgnore();
      this.sortData();
      this.getTotal();
      this.renderData();
    },
    checkIgnore() {
      this.data.forEach((d) => {
        d.data.forEach((item) => {
          const isIgnore = this.ignoreList.find((i) => item.code.includes(i));
          if (isIgnore) item.isIgnore = true;
        });
      });
    },
    sortData() {
      this.data.forEach((d) => {
        d.data.sort((a, b) => {
          return a.isIgnore ? 1 : b.isIgnore ? -1 : 0;
        });
      });
    },
    getTotal() {
      this.data.forEach((d) => {
        const totalCredit = d.data.reduce((acc, curr) => {
          if (curr.isHead) return acc;
          if (curr.isIgnore) return acc;
          return acc + parseInt(curr.credit);
        }, 0);

        const avg = d.data.reduce(
          (acc, curr) => {
            const point = parseFloat(curr.point);
            const credit = parseInt(curr.credit);

            if (curr.isIgnore || isNaN(point) || isNaN(credit)) return acc;
            return {
              point: acc.point + point * credit,
              credit: acc.credit + credit
            };
          },
          {
            point: 0,
            credit: 0
          }
        );

        d.totalCredit = totalCredit;
        d.avgPoint = (avg.point / avg.credit).toFixed(3);
      });
    },
    updateTime() {
      this.updatedAt = new Date();
      this.renderTime();
    },
    renderUser() {
      if (!this.fullName || !this.userId) return;
      $(".user-info").innerHTML = `${this.fullName} - ${this.userId}`;
      $(".user-info").classList.remove("hide");
    },
    renderTime() {
      $("#updatedAt").innerText = `(Cập nhật ${formatTime(this.updatedAt)})`;
    },
    renderData() {
      const tableHtmls = this.data
        .map((group, groupIdx) => {
          const data = group.data.map((item, itemIdx) => {
            const isSearch =
              removeVietnameseTones(item.name.toLowerCase()).includes(this.queyText) || this.queyText == "";
            const isHide = !isSearch || (item.isIgnore && this.isOnlyCalcGPA);

            const classValue = `row-data ${item.isIgnore ? "ignore" : ""} ${isHide ? "hide" : ""} `.trim();

            return `
            <tr
                class="${classValue}"
                data-item-idx=${itemIdx}
                data-group-idx=${groupIdx}
                ${item.isIgnore ? 'title="Môn học này không tính vào GPA trung bình"' : ""}
            >
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td style="min-width: 20px;">${item.credit}</td>
                <td style="min-width: 20px;">${item.point || ""}</td>
                <td class="btn-delete" style="min-width: 20px;">x</td>
            </tr>
            `;
          });

          const dataHtmls = data.join("");

          return `
          <tr class="row-head" data-group-idx=${groupIdx}>
              <td colspan="5">
                <div class="row-wrap">
                  <div class="row-wrap-left"><span>${group.title}</span> <span class="btn">+</span></div> 
                  <div class="row-wrap-right">${group.totalCredit} - ${group.avgPoint}</div>
                </div>
              </td>
          </tr>
          ${dataHtmls}
          `;
        })
        .join("");

      const totalCredit = this.data.reduce((acc, curr) => {
        return acc + parseInt(curr.totalCredit);
      }, 0);

      const avgTotal = { point: 0, credit: 0 };

      this.data.forEach((item) => {
        if (isNaN(item.avgPoint)) return;
        const avg = item.data.reduce(
          (acc, curr) => {
            const point = parseFloat(curr.point);
            const credit = parseInt(curr.credit);

            if (curr.isIgnore || isNaN(point) || isNaN(credit)) return acc;
            return {
              point: acc.point + point * credit,
              credit: acc.credit + credit
            };
          },
          {
            point: 0,
            credit: 0
          }
        );

        avgTotal.point += avg.point;
        avgTotal.credit += avg.credit;
      });

      $("table.data").innerHTML = tableHtmls;
      $(".total-credit span").innerText = totalCredit;
      $(".avg-point span").innerText = (avgTotal.point / avgTotal.credit).toFixed(3);
    },
    handle() {
      $(".no-data .nav-link").onclick = () => {
        chrome.tabs.update({
          url: _URL_TIENICHSV + "/#/diem"
        });
      };

      $(".btn-import-data").onclick = () => {
        injectScriptActiveTab(getTabURL);
        injectScriptActiveTab(getData);
      };

      $("#only-calc-gpa").onchange = (e) => {
        this.isOnlyCalcGPA = e.target.checked;
        this.renderData();
      };

      $("#search-subject").oninput = debounce((e) => {
        const value = e.target.value.trim().toLowerCase();
        this.queyText = removeVietnameseTones(value);
        this.renderData();
      });

      $("table.data").onclick = (e) => {
        const rowData = e.target.closest(".row-data");
        const deleteBtn = e.target.closest(".btn-delete");

        const groupIdx = parseInt(rowData.dataset.groupIdx);
        const itemIdx = parseInt(rowData.dataset.itemIdx);

        if (deleteBtn) {
          this.data[groupIdx].data.splice(itemIdx, 1);
          this.updateData();
          return;
        }
      };
    },
    start() {
      // important
      this.subscribe();
      this.handle();

      this.firstCheck();

      this.renderUser();
      this.renderData();
      this.renderTime();
    }
  };
})().start();
