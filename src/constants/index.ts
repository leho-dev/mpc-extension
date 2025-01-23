export const _DEBOUNCE_TIME: number = 1000;
export const _ERROR_MESSAGE_TIMEOUT: number = 5000;

export const _ACTION_CREATE = "create" as const;
export const _ACTION_UPDATE = "update" as const;

export const _ACTIVE_CLASS = "active";

export const _TIENICHSV_URL = "https://tienichsv.ou.edu.vn" as const;
export const _TIENICHSDH_URL = "https://tienichsdh.ou.edu.vn" as const;
export const _FB_HOMEPAGE_URL: string = "https://www.facebook.com/CLBLapTrinhTrenThietBiDiDong" as const;
export const _GITHUB_URL: string = "https://github.com/holedev/mpc-extension" as const;

export const _POINT_KEY = "point" as const;
export const _USER_KEY = "user" as const;
export const _COURSE_KEY = "course" as const;
export const _IGNORE_LIST_KEY = "ignoreList" as const;
export const _FLAG_ERROR_KEY = "flagError" as const;
export const _CURR_TAB_KEY = "currTab" as const;

export const _USER_LABEL_MAPPING: UserLabelMappingType = {
  userId: "Mã số sinh viên",
  fullName: "Họ và tên",
  dateOfBirth: "Ngày sinh",
  gender: "Giới tính",
  phone: "Số điện thoại",
  identityNumber: "Số CMND",
  email: "Email",
  placeOfBirth: "Nơi sinh",
  ethnicity: "Dân tộc",
  religion: "Tôn giáo",
  presenceStatus: "Tình trạng học tập",
  residentialAddress: "Địa chỉ thường trú",
  userType: "Đối tượng",
  updatedAt: "Cập nhật"
};

export const _COURSE_LABEL_MAPPING: CourseLabelMappingType = {
  classCode: "Mã lớp",
  major: "Ngành",
  faculty: "Khoa",
  degreeProgram: "Chương trình đào tạo",
  academicYear: "Niên khóa",
  updatedAt: "Cập nhật"
};
