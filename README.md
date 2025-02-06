# MPC EXTENSION

Extension hỗ trợ sinh viên trường Đại học Mở TP. HCM trong việc lên kế hoạch học tập. Công cụ này giúp tối ưu hóa quá trình học tập và lập kế hoạch học tập cá nhân, giúp sinh viên theo dõi kết quả học tập, tính toán điểm trung bình, và lên lộ trình học hiệu quả hơn.

## Cách sử dụng

Thêm trực tiếp [extension tại Chrome Web Store](https://chromewebstore.google.com/detail/mpc-extension/lidfnknnjlblinmhnbbkbodjkjoheanj).

## Build từ mã nguồn (pnpm)

```bash
git clone git@github.com:holedev/mpc-extension.git
cd mpc-extension

pnpm install
pnpm build
```

Sau khi build, folder **dist** sẽ được tạo ra.

1. Vào trình duyệt lõi Chromium (Chrome, Edge, Brave,...) -> Setting -> Extensions -> Manage Extension.
2. Bật Developer Mode -> Chọn Load unpacked -> Chọn folder **dist**.
3. Vào website tienichsv.ou.edu.vn, chuyển sang tab điểm và sử dụng extension.

## Cách đóng góp mã nguồn

Xem tại [CONTRIBUTING.md](https://github.com/holedev/mpc-extension/blob/dev/CONTRIBUTING.md)

## Giấy phép

[GNU](https://choosealicense.com/licenses/gpl-3.0/)

## Tác giả

[@mpc](https://www.facebook.com/CLBLapTrinhTrenThietBiDiDong)
