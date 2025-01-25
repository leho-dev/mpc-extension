type ParentItemCategory = "#dialog" | "#nav" | "#error" | "#container" | "#footer";
type ContainerItemCategory = "app" | "info" | "statistics" | "settings";
type ChromeMessageTypeCategory = "CHECK_URL" | "GET_DATA_POINT" | "GET_DATA_USER_COURSE";
type ActionCategory = "create" | "update";
type UserLabelMappingType = {
  [K in keyof UserType]: string;
};
type CourseLabelMappingType = {
  [K in keyof CourseType]: string;
};

type UserType = {
  userId: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  identityNumber: string;
  email: string;
  placeOfBirth: string;
  ethnicity: string;
  religion: string;
  presenceStatus: string;
  residentialAddress: string;
  updatedAt: Date;
};

type CourseType = {
  classCode: string;
  major: string;
  faculty: string;
  degreeProgram: string;
  academicYear: string;
  updatedAt: Date;
};

type IgnoreListType = {
  data: string[];
  updatedAt: Date;
};

type SubjectType = {
  code: string;
  name: string;
  credit: number;
  point: number;
  isIgnore?: boolean;
  isHead?: boolean;
};

type SemesterType = {
  id: number;
  title: string;
  data: SubjectType[];
  totalCredit: number;
  avgPoint: number;
};

type PointDataType = {
  data: SemesterType[];
  isOnlyCalcGPA: boolean;
  queyText: string;
  updatedAt: Date;
};
