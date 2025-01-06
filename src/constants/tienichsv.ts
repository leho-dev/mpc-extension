export const _TIENICHSV_IGNORE_SUBJECT_DEFAULT: IgnoreItemType[] = [
  "_", // BHYT, Đồng phục thể dục
  "MEETING", // Sinh hoạt lớp
  "PEDU", // Giáo dục thể chất
  "DEDU", // Giáo dục quốc phòng
  "TEST", // Kiểm tra đầu vào
  "GENG0", // Tiếng Anh căn bản
  "GENG4" // Tiếng Anh đầu ra
];

export const _TIENICHSV_KEY: string = "tienichsv";

export const _TIENICHSV_DEFAULT: TienichsvDataType = {
  fullName: "",
  userId: "",
  ignoreList: _TIENICHSV_IGNORE_SUBJECT_DEFAULT,
  updatedAt: new Date(),
  isOnlyCalcGPA: false,
  queyText: "",
  data: []
};

export const _TIENICHSV_URL: string = "https://tienichsv.ou.edu.vn";
