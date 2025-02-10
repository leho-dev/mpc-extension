import { _ACTIVE_CLASS, _COURSE_KEY, _IGNORE_LIST_KEY, _POINT_KEY, _USER_KEY } from "./constants";
import {
  _DEFAULT_COURSE_DATA,
  _DEFAULT_IGNORE_SUBJECT_DATA,
  _DEFAULT_POINT_DATA,
  _DEFAULT_USER_DATA
} from "./constants/default";
import { getLocalData } from "./utils";
import { setError } from "./utils/globalDOM";
import { ContainerQS, NavQS, NavQSA } from "./utils/query";

const Statistics = () => {
  const pointData: PointDataType = getLocalData(_POINT_KEY, _DEFAULT_POINT_DATA);
  const userData: UserType = getLocalData(_USER_KEY, _DEFAULT_USER_DATA);
  const courseData: CourseType = getLocalData(_COURSE_KEY, _DEFAULT_COURSE_DATA);

  const statContainer = ContainerQS("#statistics") as HTMLElement;
  const noDataE = statContainer.querySelector(".no-data") as HTMLElement;
  const mainDataE = statContainer.querySelector(".main-data") as HTMLElement;
  const resultE = mainDataE.querySelector(".result") as HTMLElement;
  const navButtons = noDataE.querySelectorAll("button");

  const state = {
    point: pointData,
    user: userData,
    course: courseData
  };

  const firstCheck = () => {
    const hasPrevData = state.point.data && state.point.data.length > 0 && state.user.userId && state.course.classCode;
    if (hasPrevData) {
      noDataE.classList.remove(_ACTIVE_CLASS);
      mainDataE.classList.add(_ACTIVE_CLASS);
    } else {
      setError("Vui lòng nhập thông tin điểm và người dùng trước!");
      noDataE.classList.add(_ACTIVE_CLASS);
    }
  };

  const eventHandlers = () => {
    navButtons.forEach((navBtn) => {
      navBtn.onclick = (e: Event) => {
        const target = e.target as HTMLElement;
        const component = target.dataset.id as ContainerItemCategory;
        const navItem = NavQS(`.nav-item[data-id="${component}"]`) as HTMLElement;
        navItem.click();
      };
    });
  };

  const getStatistics = () => {};

  const renderData = () => {};

  return {
    onMount() {
      firstCheck();
      eventHandlers();
      renderData();
    },
    onUnmount() {
      console.info("MPC Extension -> Statistics unmounted");
    }
  };
};

export { Statistics };
