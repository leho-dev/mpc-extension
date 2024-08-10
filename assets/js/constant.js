export const _IGNORE_SUBJECT_DEFAULT = [
    '_', // BHYT, Đồng phục thể dục
    'MEETING', // Sinh hoạt lớp
    'PEDU', // Giáo dục thể chất
    'DEDU', // Giáo dục quốc phòng
    'TEST', // Kiểm tra đầu vào
    'GENG0', // Tiếng Anh căn bản
    'GENG4' // Tiếng Anh đầu ra
];

export const _CAPYBARA = 'capybara';

export const _CAPYBARA_DEFAULT = {
    ignoreList: _IGNORE_SUBJECT_DEFAULT,
    updatedAt: new Date(),
    isOnlyCalcGPA: false,
    queyText: '',
    data: []
};

export const _URL_TIENICHSV = 'https://tienichsv.ou.edu.vn/#/diem';
