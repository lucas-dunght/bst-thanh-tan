# 🌸 Bộ Sưu Tập Thanh Tân - Rosier Fresh Tea & Coffee

Dự án Landing Page tương tác và giới thiệu bộ sưu tập thức uống "Thanh Tân" (Trà Lê Hoa Anh Đào & Trà Hồng Đào) của hệ thống Rosier.

## 🌟 Điểm nổi bật
- **Hiệu ứng cuộn tương tác (Scroll Animation):** Thay đổi sắc thái khung cảnh làm ngạc nhiên người xem khi cuộn trang, chuyển mượt mà từ tông Xám u tối sang Hồng trong trẻo thông qua DOM `IntersectionObserver`.
- **Trải nghiệm Typography:** Các khối chữ và hình ảnh sản phẩm được thiết lập hiện dần theo nhịp lướt tiến tới của người dùng (Fade-in on scroll).
- **Barista Ảo Tâm Lý (AI Chatbot):** Tích hợp AI đóng vai trò như một nhân viên Barista ảo của quán. Nhiệm vụ chính là trò chuyện, thấu hiểu sự mệt mỏi của dân văn phòng và khéo léo giới thiệu trải nghiệm đồ uống "Thanh Tân" để chữa lành.

## 💻 Công nghệ sử dụng (Tech Stack)
- **Cấu trúc giao diện:** HTML5, CSS3. Tận dụng sức mạnh của CSS Variables gốc (Vanilla CSS) nhằm cho ra tốc độ tải vi diệu mà không bị rườm rà.
- **Luồng xử lý (Logic):** Vanilla Javascript chuẩn ES6.
- **Khối chức năng AI:** Sử dụng thư viện `openai` SDK, kết nối với API nội bộ của dự án.
- **Công cụ biên dịch:** [Vite](https://vitejs.dev) — hỗ trợ phản hồi nhanh lúc lập trình (hot-reload) và đóng gói siêu nhẹ gọn khi Deploy.

## 🚀 Cài đặt chạy thử tại máy (Local Development)

Chạy dự án ở hệ thống cá nhân chỉ trong vài dòng lệnh:

1. Cài đặt các thư viện cần thiết:
   ```bash
   npm install
   ```

2. Khởi động máy chủ ảo:
   ```bash
   npm run dev
   ```

Hệ thống sẽ thông báo cổng thực thi (thông thường là `http://localhost:5173`). Bạn chỉ cần nhấn vào link để xem thành quả.

## 🌍 Triển khai lên máy chủ (Deployment)
Dự án được tương thích 100% với **Vercel**. 
Bất cứ một thao tác nào bạn thực thi chỉnh sửa và **Push** mã nguồn lên nhánh `main` của GitHub, Vercel sẽ tự động thực hiện quá trình build (lệnh `vite build`) và làm mới liên kết trang web chính thức mà bạn không cần phải làm gì thêm!
