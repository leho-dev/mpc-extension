true&&(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
}());

const _DEBOUNCE_TIME = 1e3;
const _ERROR_MESSAGE_TIMEOUT = 5e3;
const _ACTION_CREATE = "create";
const _ACTION_UPDATE = "update";

const injectScriptActiveTab = (injectScript) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: injectScript
    }).then(() => console.info("Injected JS!")).catch((err) => console.error(err));
  });
};
function debounce(func, timeout = _DEBOUNCE_TIME) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}
function removeVietnameseTones(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").replace(/[^\w\s]/gi, "").toLowerCase();
}
function formatTime(time) {
  const options = {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  };
  const date = new Date(time);
  return date.toLocaleString("en-US", options);
}
function getLocalData(key, defaultValue = {}) {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
}
function setLocalData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

const _TIENICHSV_IGNORE_SUBJECT_DEFAULT = [
  "_",
  // BHYT, Đồng phục thể dục
  "MEETING",
  // Sinh hoạt lớp
  "PEDU",
  // Giáo dục thể chất
  "DEDU",
  // Giáo dục quốc phòng
  "TEST",
  // Kiểm tra đầu vào
  "GENG0",
  // Tiếng Anh căn bản
  "GENG4"
  // Tiếng Anh đầu ra
];
const _TIENICHSV_KEY = "tienichsv";
const _TIENICHSV_DEFAULT = {
  fullName: "",
  userId: "",
  ignoreList: _TIENICHSV_IGNORE_SUBJECT_DEFAULT,
  updatedAt: /* @__PURE__ */ new Date(),
  isOnlyCalcGPA: false,
  queyText: "",
  data: []
};
const _TIENICHSV_URL = "https://tienichsv.ou.edu.vn";

const $ = (selector) => document.querySelector(selector);
const _$$ = (selector) => document.querySelectorAll(selector);
const getTabURL = async () => {
  const URL = window.location.href;
  await chrome.runtime.sendMessage({
    type: "CHECK_URL",
    payload: { URL }
  }).then(() => console.info("Send message success!")).catch((err) => console.error(err));
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
        data: [],
        totalCredit: 0,
        avgPoint: 0
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
  await chrome.runtime.sendMessage({ type: "GET_DATA", payload: { data, user: { userId, fullName } } }).then(() => console.info("Send message success!")).catch((err) => console.error(err));
};
const setError = (message) => {
  $(".error-message").innerHTML = message;
  $(".error-message").classList.remove("hide");
  setTimeout(() => {
    $(".error-message").classList.add("hide");
  }, _ERROR_MESSAGE_TIMEOUT);
};
const showDialog = (semester, action, subject) => {
  $(".form-subject .title").innerHTML = semester.title;
  const formFieldsetLegend = $(".form-subject fieldset legend");
  const formSubmitBtn = $(".form-subject button.btn-add-subject");
  const inputList = _$$(".form-subject input");
  formSubmitBtn.dataset.action = action;
  formSubmitBtn.dataset.idx = semester.idx.toString();
  switch (action) {
    case _ACTION_CREATE:
      formFieldsetLegend.innerHTML = "Thêm môn học";
      formSubmitBtn.innerHTML = "Thêm mới";
      break;
    case _ACTION_UPDATE:
      formFieldsetLegend.innerHTML = "Cập nhật môn học";
      formSubmitBtn.innerHTML = "Cập nhật";
      if (!subject) break;
      inputList[0].value = subject.name;
      inputList[1].value = subject.code;
      inputList[2].value = subject.credit?.toString();
      inputList[3].value = subject.point?.toString();
      break;
  }
  $(".dialog").classList.add("show");
};
const closeDialog = () => {
  $(".dialog").classList.remove("show");
  _$$(".form-subject input").forEach((input) => {
    input.value = "";
  });
};
(() => {
  const dataTienichsv = getLocalData(_TIENICHSV_KEY, _TIENICHSV_DEFAULT);
  return {
    fullName: dataTienichsv.fullName,
    userId: dataTienichsv.userId,
    ignoreList: dataTienichsv.ignoreList,
    updatedAt: dataTienichsv.updatedAt,
    data: dataTienichsv.data,
    queyText: dataTienichsv.queyText,
    isOnlyCalcGPA: dataTienichsv.isOnlyCalcGPA,
    subscribe() {
      chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
        const { type, payload } = request;
        switch (type) {
          case "CHECK_URL": {
            const { URL } = payload;
            const _URL_TIENICHSV_DIEM = _TIENICHSV_URL + "/#/diem";
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
      setLocalData(_TIENICHSV_KEY, {
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
      const checkDataValid = this.userId && this.fullName && this.data;
      if (checkDataValid) {
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
    updateData(data) {
      if (data) this.data = data;
      this.saveDataCurrent();
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
          return acc + curr.credit;
        }, 0);
        const avg = d.data.reduce(
          (acc, curr) => {
            const point = curr.point;
            const credit = curr.credit;
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
        d.avgPoint = parseFloat((avg.point / avg.credit).toFixed(3));
      });
    },
    updateTime() {
      this.updatedAt = /* @__PURE__ */ new Date();
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
      const tableHtmls = this.data.map((group, groupIdx) => {
        const data = group.data.map((item, itemIdx) => {
          const isSearch = removeVietnameseTones(item.name.toLowerCase()).includes(this.queyText) || this.queyText == "";
          const isHide = !isSearch || item.isIgnore && this.isOnlyCalcGPA;
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
                  <div class="row-wrap-left"><span>${group.title}</span> <span class="btn btn-add-subject">+</span></div> 
                  <div class="row-wrap-right">${group.totalCredit} - ${group.avgPoint}</div>
                </div>
              </td>
          </tr>
          ${dataHtmls}
          `;
      }).join("");
      const totalCredit = this.data.reduce((acc, curr) => {
        return acc + curr.totalCredit;
      }, 0);
      const avgTotal = { point: 0, credit: 0 };
      this.data.forEach((item) => {
        if (isNaN(item.avgPoint) || !item.avgPoint) return;
        const avg = item.data.reduce(
          (acc, curr) => {
            const point = curr.point;
            const credit = curr.credit;
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
      $(".total-credit span").innerText = totalCredit.toString();
      $(".avg-point span").innerText = (avgTotal.point / avgTotal.credit).toFixed(3);
    },
    handle() {
      $(".no-data .nav-link").onclick = () => {
        chrome.tabs.update({
          url: _TIENICHSV_URL + "/#/diem"
        });
      };
      $(".btn-import-data").onclick = () => {
        injectScriptActiveTab(getTabURL);
        injectScriptActiveTab(getData);
      };
      $("#only-calc-gpa").onchange = (e) => {
        const target = e.target;
        this.isOnlyCalcGPA = target.checked;
        this.renderData();
      };
      $("#search-subject").oninput = debounce((e) => {
        const target = e.target;
        const value = target.value.trim().toLowerCase();
        this.queyText = removeVietnameseTones(value);
        this.renderData();
      });
      $(".dialog").onclick = (e) => {
        const target = e.target;
        const isDialogBody = target.closest(".dialog-body");
        !isDialogBody && closeDialog();
      };
      $(".btn-close-dialog").onclick = closeDialog;
      $(".form-subject").onsubmit = (e) => {
        e.preventDefault();
        const submitter = e.submitter;
        const action = submitter.dataset.action;
        const idx = parseInt(submitter.dataset.idx || "0");
        const inputList = _$$(".form-subject input");
        const name = inputList[0].value.trim();
        const code = inputList[1].value.trim();
        const credit = parseInt(inputList[2].value.trim());
        const point = parseFloat(inputList[3].value.trim());
        if (!name || !code || !credit || !point) {
          setError("Vui lòng điền đầy đủ thông tin!");
          return;
        }
        const isExist = this.data.find((d) => d.data.find((item) => item.code === code));
        if (isExist && action === _ACTION_CREATE) {
          setError("Mã môn học đã tồn tại!");
          return;
        }
        if (action === _ACTION_CREATE) {
          this.data[idx].data.push({ name, code, credit, point });
        }
        if (action === _ACTION_UPDATE) {
          const itemIdx = this.data[idx].data.findIndex((item) => item.code === code);
          this.data[idx].data[itemIdx] = { name, code, credit, point };
        }
        this.updateData();
        closeDialog();
      };
      $("table.data").onclick = (e) => {
        const target = e.target;
        const rowData = target.closest(".row-data");
        const deleteBtn = target.closest(".btn-delete");
        const addSubjectButton = target.closest(".btn-add-subject");
        if (deleteBtn) {
          const groupIdx = parseInt(rowData.dataset.groupIdx);
          const itemIdx = parseInt(rowData.dataset.itemIdx);
          this.data[groupIdx].data.splice(itemIdx, 1);
          this.updateData();
          return;
        }
        if (rowData) {
          const groupIdx = parseInt(rowData.dataset.groupIdx);
          const itemIdx = parseInt(rowData.dataset.itemIdx);
          const semester = this.data[groupIdx];
          const subject = this.data[groupIdx].data[itemIdx];
          showDialog({ title: semester.title, idx: groupIdx }, _ACTION_UPDATE, subject);
          return;
        }
        if (addSubjectButton) {
          const rowHead = target.closest(".row-head");
          const semester = this.data[parseInt(rowHead.dataset.groupIdx)];
          showDialog({ title: semester.title, idx: parseInt(rowHead.dataset.groupIdx) }, _ACTION_CREATE);
          return;
        }
      };
    },
    start() {
      this.subscribe();
      this.handle();
      this.firstCheck();
      this.renderUser();
      this.renderData();
      this.renderTime();
    }
  };
})().start();
