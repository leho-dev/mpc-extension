type IgnoreItemType = "_" | "MEETING" | "PEDU" | "DEDU" | "TEST" | "GENG0" | "GENG4";
type ActionType = "create" | "update";

type UserType = {
  userId: string;
  fullName: string;
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

type TienichsvDataType = {
  fullName: string;
  userId: string;
  ignoreList: IgnoreItemType[];
  updatedAt: Date;
  isOnlyCalcGPA: boolean;
  queyText: string;
  data: SemesterType[];
};
