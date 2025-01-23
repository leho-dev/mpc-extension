import { _ACTIVE_CLASS, _COURSE_KEY, _FLAG_ERROR_KEY, _TIENICHSDH_URL, _TIENICHSV_URL, _USER_KEY } from "./constants";
import { _DEFAULT_COURSE_DATA, _DEFAULT_USER_DATA } from "./constants/default";
import { getLocalData, injectScriptActiveTab, setLocalData } from "./utils";
import { getTabURL, GetURLMessageType, removeError, setError } from "./utils/globalDOM";
import { ContainerQS } from "./utils/query";

type GetDataPointMessageType = {
  type: ChromeMessageTypeCategory;
  payload: {
    userData: UserType;
    courseData: CourseType;
  };
};

const getData = async () => {
  const type: ChromeMessageTypeCategory = "GET_DATA_USER_COURSE";
  const appUserElement = document.querySelector("app-userinfo > div > div > div > div.card") as HTMLElement;

  const userInfoElement = appUserElement.querySelector("div.card-body") as HTMLElement;
  const courseInfoElement = appUserElement.querySelectorAll("div.card")[0] as HTMLElement;

  const userInfoValues: NodeListOf<HTMLElement> = userInfoElement.querySelectorAll(
    ".container-fluid > .row > div:first-child > .row > div:last-child"
  );
  const courseInfoValues: NodeListOf<HTMLElement> = courseInfoElement.querySelectorAll(
    ".container-fluid > .row > div:first-child > .row > div:last-child"
  );

  const userData: UserType = {
    userId: userInfoValues[0].innerText || "",
    fullName: userInfoValues[1].innerText || "",
    dateOfBirth: userInfoValues[2].innerText || "",
    gender: userInfoValues[3].innerText || "",
    phone: userInfoValues[4].innerText || "",
    identityNumber: userInfoValues[5].innerText || "",
    email: userInfoValues[6].innerText || "",
    placeOfBirth: userInfoValues[7].innerText || "",
    ethnicity: userInfoValues[8].innerText || "",
    religion: userInfoValues[9].innerText || "",
    presenceStatus: userInfoValues[10].innerText || "",
    residentialAddress: userInfoValues[11].innerText || "",
    userType: userInfoValues[12].innerText || "",
    updatedAt: new Date()
  };

  const courseData: CourseType = {
    classCode: courseInfoValues[0].innerText || "",
    major: courseInfoValues[1].innerText || "",
    faculty: courseInfoValues[2].innerText || "",
    degreeProgram: courseInfoValues[3].innerText || "",
    academicYear: courseInfoValues[4].innerText || "",
    updatedAt: new Date()
  };

  const message: GetDataPointMessageType = { type: type, payload: { userData, courseData } };

  await chrome.runtime
    .sendMessage(message)
    .then(() => console.info("MPC Extension -> Get data success and send to the extension!"))
    .catch((err) => console.error(err));
};

const Info = () => {
  const userData: UserType = getLocalData(_USER_KEY, _DEFAULT_USER_DATA);
  const courseData: CourseType = getLocalData(_COURSE_KEY, _DEFAULT_COURSE_DATA);

  const infoContainer = ContainerQS("#info") as HTMLElement;
  const noDataE = infoContainer.querySelector(".no-data") as HTMLElement;
  const mainDataE = infoContainer.querySelector(".main-data") as HTMLElement;
  const btnImportDataE = infoContainer.querySelector(".btn-import-data") as HTMLElement;

  let listener: (
    request: { type: ChromeMessageTypeCategory; payload: any },
    _sender: chrome.runtime.MessageSender,
    _sendResponse: (response: any) => void
  ) => void;

  return {
    user: userData,
    course: courseData,
    subscribe() {
      listener = (request, _sender, _sendResponse) => {
        const { type, payload } = request;

        switch (type as ChromeMessageTypeCategory) {
          case "CHECK_URL": {
            console.info("[info.ts:81] ", "demo");
            const { URL }: GetURLMessageType["payload"] = payload;

            const _URL_TIENICHSV_INFO = _TIENICHSV_URL + "/#/userinfo";
            const _URL_TIENICHSDH_INFO = _TIENICHSDH_URL + "/#/userinfo";
            const availableURL = [_URL_TIENICHSV_INFO, _URL_TIENICHSDH_INFO];

            if (!URL) {
              setError("Không thể lấy URL của trang hiện tại!");
              setLocalData(_FLAG_ERROR_KEY, true);
              return;
            }

            if (!availableURL.includes(URL)) {
              setLocalData(_FLAG_ERROR_KEY, true);
              setError(`Vui lòng truy cập vào trang <b class="error-nav-link">${_URL_TIENICHSV_INFO}</b> trước!`);
              noDataE.classList.add(_ACTIVE_CLASS);
              return;
            }

            mainDataE.classList.add(_ACTIVE_CLASS);
            btnImportDataE.classList.add(_ACTIVE_CLASS);
            return;
          }

          case "GET_DATA_USER_COURSE": {
            const hasError = getLocalData(_FLAG_ERROR_KEY, false);
            if (hasError) {
              setLocalData(_FLAG_ERROR_KEY, false);
              noDataE.classList.remove(_ACTIVE_CLASS);
              return;
            }

            const { userData, courseData }: GetDataPointMessageType["payload"] = payload;
            if (!userData || !courseData) {
              return;
            }

            this.updateData({ user: userData, course: courseData });
            this.renderData();
            noDataE.classList.remove(_ACTIVE_CLASS);
            return;
          }
          default:
            console.error("No type match!");
            return;
        }
      };

      chrome.runtime.onMessage.addListener(listener);
    },
    unsubscribe() {
      chrome.runtime.onMessage.removeListener(listener);
    },
    firstCheck() {
      const hasPrevData = this.user.userId && this.course.classCode;
      if (hasPrevData) {
        noDataE.classList.remove(_ACTIVE_CLASS);
        mainDataE.classList.add(_ACTIVE_CLASS);
        btnImportDataE.classList.add(_ACTIVE_CLASS);
      } else {
        injectScriptActiveTab(getTabURL);
      }
    },
    updateData({ user, course }: { user: UserType; course: CourseType }) {
      this.user = user;
      this.course = course;
    },
    renderData() {},
    handle() {
      btnImportDataE.onclick = () => {
        injectScriptActiveTab(getTabURL);
        injectScriptActiveTab(getData);
      };
    },
    render() {
      this.firstCheck();
      this.handle();
    }
  };
};

export { Info };
