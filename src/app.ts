import {
  debounce,
  formatTime,
  getLocalData,
  injectScriptActiveTab,
  removeVietnameseTones,
  setLocalData
} from "./utils";
import {
  _ACTION_CREATE,
  _ACTION_UPDATE,
  _ACTIVE_CLASS,
  _ERROR_MESSAGE_TIMEOUT,
  _FLAG_ERROR_KEY,
  _IGNORE_LIST_KEY,
  _POINT_KEY,
  _TIENICHSDH_URL,
  _TIENICHSV_URL,
  _USER_KEY
} from "./constants";
import { closeDialog, setError, showDialog } from "./utils/globalDOM";
import { ContainerQS, DialogQS, DialogQSA } from "./utils/query";
import { _DEFAULT_IGNORE_SUBJECT_DATA, _DEFAULT_POINT_DATA, _DEFAULT_USER_DATA } from "./constants/default";

type GetURLMessageType = {
  type: ChromeMessageTypeCategory;
  payload: { URL: string };
};

const getTabURL = async () => {
  const type: ChromeMessageTypeCategory = "CHECK_URL";
  const URL = window.location.href;

  const message: GetURLMessageType = { type: type, payload: { URL } };

  await chrome.runtime
    .sendMessage(message)
    .then(() => console.info("MPC Extension -> Get URL success and send to the extension!"))
    .catch((err) => console.error(err));
};

type GetDataPointMessageType = {
  type: ChromeMessageTypeCategory;
  payload: {
    data: SemesterType[];
  };
};

const getData = async () => {
  const type: ChromeMessageTypeCategory = "GET_DATA_POINT";
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

  const data: SemesterType[] = [];

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

  const message: GetDataPointMessageType = { type: type, payload: { data } };

  await chrome.runtime
    .sendMessage(message)
    .then(() => console.info("MPC Extension -> Get data success and send to the extension!"))
    .catch((err) => console.error(err));
};

const showAppDialog = (semester: { title: string; idx: number }, action: ActionCategory, subject?: SubjectType) => {
  const appDialog = DialogQS("[data-id='app']") as HTMLElement;

  appDialog.querySelector(".form-subject .title")!.innerHTML = semester.title;

  const formFieldsetLegend = appDialog.querySelector(".form-subject fieldset legend") as HTMLElement;
  const formSubmitBtn = appDialog.querySelector(".form-subject button.btn-add-subject") as HTMLElement;
  const inputList = appDialog.querySelectorAll(".form-subject input") as NodeListOf<HTMLInputElement>;

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

  showDialog("app");
};

const App = () => {
  const pointData: PointDataType = getLocalData(_POINT_KEY, _DEFAULT_POINT_DATA);
  const ignoreListData: IgnoreListType = getLocalData(_IGNORE_LIST_KEY, _DEFAULT_IGNORE_SUBJECT_DATA);

  const appContainer = ContainerQS("#app") as HTMLElement;
  const noDataE = appContainer.querySelector(".no-data") as HTMLElement;
  const mainDataE = appContainer.querySelector(".main-data") as HTMLElement;
  const btnImportDataE = appContainer.querySelector(".btn-import-data") as HTMLElement;
  const updatedAtE = appContainer.querySelector(".updatedAt")! as HTMLElement;
  const navLinkE = appContainer.querySelector(".no-data .nav-link") as HTMLElement;
  const checkboxOnlyCalcGPAE = appContainer.querySelector("#only-calc-gpa") as HTMLInputElement;
  const searchInputE = appContainer.querySelector("#search-subject") as HTMLInputElement;
  const tableResultE = appContainer.querySelector("table.data") as HTMLElement;

  return {
    updatedAt: pointData.updatedAt,
    data: pointData.data,
    queyText: pointData.queyText,
    isOnlyCalcGPA: pointData.isOnlyCalcGPA,
    subscribe() {
      chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
        const { type, payload } = request;

        switch (type as ChromeMessageTypeCategory) {
          case "CHECK_URL": {
            const { URL }: GetURLMessageType["payload"] = payload;

            const _URL_TIENICHSV_DIEM = _TIENICHSV_URL + "/#/diem";
            const _URL_TIENICHSDH_DIEM = _TIENICHSDH_URL + "/#/diem";
            const availableURL = [_URL_TIENICHSV_DIEM, _URL_TIENICHSDH_DIEM];

            if (!URL) {
              setError("Không thể lấy URL của trang hiện tại!");
              setLocalData(_FLAG_ERROR_KEY, true);
              return;
            }

            if (!availableURL.includes(URL)) {
              setLocalData(_FLAG_ERROR_KEY, true);
              setError(`Vui lòng truy cập vào trang <b class="error-nav-link">${_URL_TIENICHSV_DIEM}</b> trước!`);
              noDataE.classList.add(_ACTIVE_CLASS);
              return;
            }

            mainDataE.classList.add(_ACTIVE_CLASS);
            btnImportDataE.classList.add(_ACTIVE_CLASS);
            return;
          }

          case "GET_DATA_POINT": {
            const hasError = getLocalData(_FLAG_ERROR_KEY, false);
            if (hasError) {
              setLocalData(_FLAG_ERROR_KEY, false);
              noDataE.classList.remove(_ACTIVE_CLASS);
              return;
            }

            const { data }: GetDataPointMessageType["payload"] = payload;

            if (!data.length) {
              return;
            }

            this.updateData(data);
            this.updateTime();
            this.saveDataCurrent();
            noDataE.classList.remove(_ACTIVE_CLASS);
            return;
          }
          default:
            console.error("No type match!");
            return;
        }
      });
    },
    firstCheck() {
      const checkDataValid = this.data && this.data.length > 0;
      if (checkDataValid) {
        noDataE.classList.remove(_ACTIVE_CLASS);
        mainDataE.classList.add(_ACTIVE_CLASS);
        btnImportDataE.classList.add(_ACTIVE_CLASS);

        searchInputE.value = this.queyText;
        checkboxOnlyCalcGPAE.checked = this.isOnlyCalcGPA;
      } else {
        injectScriptActiveTab(getTabURL);
      }
    },
    saveDataCurrent() {
      setLocalData(_POINT_KEY, {
        data: this.data,
        queyText: this.queyText,
        isOnlyCalcGPA: this.isOnlyCalcGPA,
        updatedAt: this.updatedAt
      });
    },
    updateData(data?: PointDataType["data"] | undefined) {
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
          const isIgnore = ignoreListData.data.find((i) => item.code.includes(i));
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
      this.updatedAt = new Date();
      this.renderTime();
    },
    renderTime() {
      updatedAtE.innerHTML = `(Cập nhật ${formatTime(this.updatedAt)})`;
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
                  <div class="row-wrap-left"><span>${group.title}</span> <span class="btn btn-add-subject">+</span></div> 
                  <div class="row-wrap-right">${group.totalCredit} - ${group.avgPoint?.toFixed(3) || NaN}</div>
                </div>
              </td>
          </tr>
          ${dataHtmls}
          `;
        })
        .join("");

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

      tableResultE.innerHTML = tableHtmls;
      appContainer.querySelector(".total-credit span")!.innerHTML = totalCredit.toString();
      appContainer.querySelector(".avg-point span")!.innerHTML = (avgTotal.point / avgTotal.credit).toFixed(3);
    },
    handle() {
      navLinkE.onclick = () => {
        chrome.tabs.update({
          url: _TIENICHSV_URL + "/#/diem"
        });
      };

      btnImportDataE.onclick = () => {
        injectScriptActiveTab(getTabURL);
        injectScriptActiveTab(getData);
      };

      checkboxOnlyCalcGPAE.onchange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        this.isOnlyCalcGPA = target.checked;
        this.saveDataCurrent();
        this.renderData();
      };

      searchInputE.oninput = debounce((e: Event) => {
        const target = e.target as HTMLInputElement;
        const value = target.value.trim().toLowerCase();
        this.queyText = removeVietnameseTones(value);
        this.saveDataCurrent();
        this.renderData();
      });

      DialogQS(".form-subject")!.onsubmit = (e: SubmitEvent) => {
        e.preventDefault();
        const submitter = e.submitter as HTMLButtonElement;

        const action = submitter.dataset.action;
        const idx = parseInt(submitter.dataset.idx || "0");

        const inputList = DialogQSA(".form-subject input") as NodeListOf<HTMLInputElement>;
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

      tableResultE.onclick = (e: Event) => {
        const target = e.target as HTMLElement;
        const rowData = target.closest(".row-data") as HTMLElement;
        const deleteBtn = target.closest(".btn-delete") as HTMLElement;
        const addSubjectButton = target.closest(".btn-add-subject") as HTMLElement;

        if (deleteBtn) {
          const groupIdx = parseInt(rowData.dataset.groupIdx!);
          const itemIdx = parseInt(rowData.dataset.itemIdx!);

          this.data[groupIdx].data.splice(itemIdx, 1);
          this.updateData();
          return;
        }

        if (rowData) {
          const groupIdx = parseInt(rowData.dataset.groupIdx!);
          const itemIdx = parseInt(rowData.dataset.itemIdx!);
          const semester = this.data[groupIdx];
          const subject = this.data[groupIdx].data[itemIdx];
          showAppDialog({ title: semester.title, idx: groupIdx }, _ACTION_UPDATE, subject);
          return;
        }

        if (addSubjectButton) {
          const rowHead = target.closest(".row-head") as HTMLElement;
          const semester = this.data[parseInt(rowHead.dataset.groupIdx!)];
          showAppDialog({ title: semester.title, idx: parseInt(rowHead.dataset.groupIdx!) }, _ACTION_CREATE);
          return;
        }
      };
    },
    render() {
      this.subscribe();
      this.handle();

      this.firstCheck();

      this.renderData();
      this.renderTime();
    }
  };
};

export { App };
