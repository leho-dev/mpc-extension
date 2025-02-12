import { _ACTIVE_CLASS, _COURSE_KEY, _IGNORE_LIST_KEY, _POINT_KEY, _USER_KEY } from "./constants";
import {
  _DEFAULT_COURSE_DATA,
  _DEFAULT_FIXED_POINT,
  _DEFAULT_IGNORE_SEMESTER_TITLE,
  _DEFAULT_IGNORE_SUBJECT_DATA,
  _DEFAULT_POINT_DATA,
  _DEFAULT_USER_DATA
} from "./constants/default";
import { getLocalData } from "./utils";
import { setError } from "./utils/globalDOM";
import { ContainerQS, NavQS } from "./utils/query";

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

  const updateState = () => {
    state.point = getLocalData(_POINT_KEY, _DEFAULT_POINT_DATA);
    state.user = getLocalData(_USER_KEY, _DEFAULT_USER_DATA);
    state.course = getLocalData(_COURSE_KEY, _DEFAULT_COURSE_DATA);
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

  const getStatistics = () => {
    const { data } = state.point;

    const dataPointAvg: { title: string; scale10: number; scale4: number }[] = [];
    const countAllSemester = data.length;
    let countIgnoreSemester = 0;
    const sumOfSemesterPoint = { scale10: 0, scale4: 0 };

    let countAllCredit = 0;
    let countIgnoreCredit = 0;

    let countAllSubject = 0;
    let countIgnoreSubject = 0;

    let countAllCharacter = 0;
    const characterCount = {
      "A+": 0,
      A: 0,
      "B+": 0,
      B: 0,
      "C+": 0,
      C: 0,
      "D+": 0,
      D: 0,
      F: 0
    } as { [key in Exclude<PointCharacterType, "M">]: number };

    data.forEach((semester) => {
      if (semester.title.includes(_DEFAULT_IGNORE_SEMESTER_TITLE) || !semester.avgPoint.scale10) {
        countIgnoreSemester++;
      }

      semester.data.forEach((subject) => {
        countAllSubject++;

        if (subject.isIgnore) {
          countIgnoreSubject++;

          if (subject.credit) {
            countIgnoreCredit += subject.credit;
          }
        } else {
          if (subject.point.scale10 && subject.point.character !== "M") {
            countAllCharacter++;
            characterCount[subject.point.character as Exclude<PointCharacterType, "M">]++;
          }
        }

        if (subject.credit) {
          countAllCredit += subject.credit;
        }
      });

      dataPointAvg.unshift({
        title: semester.title,
        scale10: semester.avgPoint.scale10,
        scale4: semester.avgPoint.scale4
      });

      sumOfSemesterPoint.scale10 += semester.avgPoint.scale10;
      sumOfSemesterPoint.scale4 += semester.avgPoint.scale4;
    });

    return {
      creditCount: {
        total: countAllCredit,
        ignore: countIgnoreCredit,
        valid: countAllCredit - countIgnoreCredit
      },
      semesterCount: {
        total: countAllSemester,
        ignore: countIgnoreSemester,
        valid: countAllSemester - countIgnoreSemester,
        avgOfSemesterPoint: {
          scale10: sumOfSemesterPoint.scale10 / (countAllSemester - countIgnoreSemester),
          scale4: sumOfSemesterPoint.scale4 / (countAllSemester - countIgnoreSemester)
        },
        dataAvg: dataPointAvg
      },
      subjectCount: {
        total: countAllSubject,
        ignore: countIgnoreSubject,
        valid: countAllSubject - countIgnoreSubject
      },
      characterCount: {
        total: countAllCharacter,
        details: characterCount
      }
    };
  };

  const getSemesterPointChartE = (data: { title: string; scale10: number; scale4: number }[]) => {
    const filteredData = data.filter((item) => {
      if (item.title === _DEFAULT_IGNORE_SEMESTER_TITLE) return false;
      if (item.scale10 === null && item.scale4 === null) return false;
      return true;
    });

    const labels = filteredData.map((item) => item.title);
    const dataScale10 = filteredData.map((item) => item.scale10);
    const dataScale4 = filteredData.map((item) => item.scale4);

    const existingCanvas = resultE.querySelector("#point-chart");
    if (existingCanvas) {
      existingCanvas.remove();
    }

    const canvasE = document.createElement("canvas");
    canvasE.id = "point-chart";
    resultE.appendChild(canvasE);

    let graphArea = canvasE.getContext("2d");

    new Chart(graphArea, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Điểm hệ 10",
            data: dataScale10,
            borderColor: "rgb(54, 162, 235)",
            backgroundColor: "rgba(54, 162, 235, 0.2)"
          },
          {
            label: "Điểm hệ 4",
            data: dataScale4,
            borderColor: "#fb900b",
            backgroundColor: "#343434"
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: "BIỂU ĐỒ ĐIỂM TRUNG BÌNH HỌC KỲ",
            font: { size: 15 }
          }
        },
        responsive: true,
        scales: {
          x: { ticks: { display: false } },
          y: { beginAtZero: true }
        }
      }
    });

    return canvasE;
  };

  const getCharacterPointChartE = (total: number, data: { [key in Exclude<PointCharacterType, "M">]: number }) => {
    const labels = Object.keys(data);

    const canvasE = document.createElement("canvas");
    canvasE.id = "character-chart";
    resultE.appendChild(canvasE);

    let graphArea = canvasE.getContext("2d");

    new Chart(graphArea, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Điểm hệ 10",
            data: Object.values(data),
            backgroundColor: [
              "rgb(0, 128, 0)",
              "rgb(50, 205, 50)",
              "rgb(30, 144, 255)",
              "rgb(70, 130, 180)",
              "rgb(255, 165, 0)",
              "rgb(255, 140, 0)",
              "rgb(255, 69, 0)",
              "rgb(220, 20, 60)",
              "rgb(128, 0, 0)"
            ]
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: `PHÂN BỐ ĐIỂM THEO THANG ĐIỂM CHỮ (${total} môn)`,
            font: { size: 15 }
          }
        },
        responsive: true,
        scales: {
          x: { ticks: { display: false } },
          y: { beginAtZero: true }
        }
      }
    });

    return canvasE;
  };

  const renderData = () => {
    updateState();
    const statData = getStatistics();

    const chartSemesterPointE = getSemesterPointChartE(statData.semesterCount.dataAvg);
    resultE.appendChild(chartSemesterPointE);

    const statHTML = `
      <div class="credit">
        <h4>Tín chỉ <span>${statData.creditCount.total}</span></h4>
        <div>Số lượng: <span>${statData.creditCount.valid}</span></div>
        <div>Không tính GPA: <span>${statData.creditCount.ignore}</span></div>
      </div>
      <div class="semester">
        <h4>Học kỳ <span>${statData.semesterCount.total}</span></h4>
        <div>Số lượng: <span>${statData.semesterCount.valid}</span></div>
        <div>Bảo lưu hoặc điểm TB NaN: <span>${statData.semesterCount.ignore}</span></div>
        <div>Điểm TB mỗi kỳ (10):
          <span>${statData.semesterCount.avgOfSemesterPoint.scale10.toFixed(_DEFAULT_FIXED_POINT)}</span>
        </div>
        <div>Điểm TB mỗi kỳ (4):
          <span>${statData.semesterCount.avgOfSemesterPoint.scale4.toFixed(_DEFAULT_FIXED_POINT)}</span>
        </div>
      </div>
      <div class="subject" style="margin-bottom: 20px;">
        <h4>Môn học <span>${statData.subjectCount.total}</span></h4>
        <div>Số lượng: <span>${statData.subjectCount.valid}</span></div>
        <div>Không tính GPA: <span>${statData.subjectCount.ignore}</span></div>
      </div>
    `;

    resultE.insertAdjacentHTML("beforeend", statHTML);

    const chartCharacterPointE = getCharacterPointChartE(
      statData.characterCount.total,
      statData.characterCount.details
    );
    resultE.appendChild(chartCharacterPointE);
  };

  return {
    onMount() {
      firstCheck();
      eventHandlers();
      renderData();
    },
    onUnmount() {
      resultE.innerHTML = "";
      console.info("MPC Extension -> Statistics unmounted");
    }
  };
};

export { Statistics };
