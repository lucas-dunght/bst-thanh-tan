# Hướng dẫn tạo Google Apps Script (Webhook Backend) cho Chatbot Thanh Tân

> **Mục đích:** Nhận dữ liệu Lead từ chatbot trên Landing Page, ghi vào Google Sheets, và tự động gửi email cảnh báo khi phát hiện khách hàng "hot".

## Bước 1: Setup Google Sheets chuẩn cấu trúc

1. Truy cập [Google Sheets](https://docs.google.com/spreadsheets) và tạo một Bảng tính trống MỚI.
2. Tại Dòng đầu tiên (Row 1), tạo các tiêu đề cột đúng theo thứ tự từ trái sang phải như sau. (Thứ tự cột cực kỳ quan trọng so với phần code bên dưới).

| Cột | Tiêu đề |
|-----|---------|
| A | Thời gian |
| B | Tên |
| C | SĐT |
| D | Nguồn |
| E | Session ID |
| F | Lịch sử Chat |
| G | Quan tâm |
| H | Mức độ |

## Bước 2: Viết mã nguồn Google Apps Script (Backend)

1. Ở chính trang Google Sheets đó, trên thanh menu bạn bấm chọn **Tiện ích mở rộng (Extensions)** > Chọn **Apps Script**.
2. Một cửa sổ code mở ra. Xoá đoạn mã gốc `function myFunction() {}` đi.
3. Paste (dán) toàn bộ đoạn mã dưới đây vào:

```javascript
function doPost(e) {
  try {
    // Lấy sheet đang dùng
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Lấy raw dữ liệu bắn lên từ JS Web (chuỗi JSON)
    const rawData = e.postData.contents;
    const data = JSON.parse(rawData);
    
    // Gán biến
    const name = data.name || "";
    const phone = data.phone || "";
    const interest = data.interest || "";
    const intentLevel = data.intent_level || "";
    const sessionId = data.sessionId || "";
    
    const source = "Landing Page Thanh Tân";
    const chatHistory = ""; // Demo bài này có thể để trống
    const timestamp = new Date();
    
    // LOGIC CẬP NHẬT GỘP: Kiểm tra dựa theo `Session ID` (Cột E = index 4 trong mảng 0)
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    let rowIndex = -1; // -1 nghĩa là chưa tồn tại Session này
    
    // Bỏ qua dòng tiêu đề (i=1), quét tìm theo cột E
    for (let i = 1; i < values.length; i++) {
        if (values[i][4] === sessionId) { 
            rowIndex = i + 1; // Google array bắt đầu index từ 0, spreadsheet bắt đầu từ Row 1
            break;
        }
    }
    
    if (rowIndex > -1) {
        // CẬP NHẬT (Update Record Mới Nhất) - Thay thế vào row cũ
        const currentRow = values[rowIndex - 1];
        
        // Cập nhật lại giá trị nếu khách hàng cung cấp mới thông tin
        // (không ghi đè dữ liệu rỗng lên dữ liệu đã có)
        sheet.getRange(rowIndex, 2).setValue(name || currentRow[1]);         // Tên (Cột B)
        sheet.getRange(rowIndex, 3).setValue(phone || currentRow[2]);        // SĐT (Cột C)
        sheet.getRange(rowIndex, 7).setValue(interest || currentRow[6]);     // Quan tâm (Cột G)
        sheet.getRange(rowIndex, 8).setValue(intentLevel || currentRow[7]);  // Mức độ (Cột H)
        // Không sửa lại Thời gian (Cột A) và Nguồn để bảo toàn trạng thái gốc
    } else {
        // TẠO MỚI DỄ DÀNG (Append Row Mới)
        sheet.appendRow([
            timestamp, 
            name, 
            phone, 
            source, 
            sessionId, 
            chatHistory, 
            interest, 
            intentLevel
        ]);
    }
    
    // ============================================
    // LOGIC: GỬI EMAIL CẢNH BÁO CHO "LEAD KHÁCH HOT"
    // ============================================
    if (intentLevel.toLowerCase() === "hot") {
        // TODO: Đổi email bên dưới thành Email của Sales/Quản lý trực tiếp.
        const adminEmail = "email-cua-ban@gmail.com"; 
        const subject = "🔥 KHÁCH HÀNG NÓNG - CẦN LIÊN HỆ NGAY!";
        
        // Nội dung theo chuẩn template yêu cầu
        const body = `KHÁCH HÀNG NÓNG - CẦN LIÊN HỆ NGAY!\n\n` + 
                     `Tên: ${name}\n` +
                     `SĐT: ${phone}\n` +
                     `Quan tâm: ${interest}\n` +
                     `Thời gian: ${timestamp}\n\n` +
                     `Vui lòng liên hệ khách hàng này nhanh nhất có thể!`;
                     
        MailApp.sendEmail(adminEmail, subject, body);
    }
    
    // Trả về JSON thành công 
    return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Trả về Exception nếu Backend dính lỗi
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Bước 3: Cấp quyền và Lấy Webhook URL ("Deploy")

> **CHÚ Ý:** Đây là bước dễ làm sai nhất. Hãy đi từng bước chậm!

1. Ở góc trên cùng bên phải cửa sổ mã, nhấp vào nút **Triển khai (Deploy)** màu xanh dương -> Chọn **Lần triển khai mới (New deployment)**.
2. Ở popup hiện ra, click vào hình răng cưa (Chọn loại / Select type) -> Chọn **Ứng dụng web (Web app)**.
3. Trong biểu mẫu thiết lập:
   - **Mô tả:** Code Chatbot Hook
   - **Thực thi dưới dạng (Execute as):** Giữ nguyên `Me` (Bạn).
   - **Người có quyền truy cập (Who has access):** CHỌN NGAY `Bất kỳ ai` (**Anyone**). *(Bắt buộc phải là dòng này, nếu khác script sẽ báo lỗi 401 khi Frontend fetch)*.
4. Bấm **Triển khai**.
5. Lúc này Google đòi quyền Cấp phép (Authorize Access) vì script có chức năng sửa Spreadsheet và gửi thư (MailApp).
   - Bạn chọn tài khoản Google của bạn -> Bấm nút **Advanced (Nâng cao)** -> Chọn dòng dưới cùng "Tiếp tục truy cập / Đi tới Dự án không có tiêu đề (không an toàn)".
   - Bấm **Cho Phép (Allow)**.
6. Sau vài giây, nó sẽ hiện một cửa sổ. Copy dòng mã ở mục **Web app URL**.
   > Nó luôn bắt đầu bằng: `https://script.google.com/macros/s/AKfycb..../exec`

## Bước 4: Khớp nối với `chatbot.js`

Mở file `chatbot.js`, vào **dòng số 3**, sửa lại hằng số `GOOGLE_SHEET_URL` thành Webhook URL bạn vừa copy được:

```javascript
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbzLqG9qK1eB4.../exec";
```

Save file lại, F5 trang web và thử chat để kiểm tra dữ liệu đã được ghi vào Google Sheet chưa.

## Checklist kiểm tra sau khi hoàn thành

- [ ] Google Sheets có đủ 8 cột tiêu đề (A đến H)
- [ ] Apps Script đã Deploy thành công, có URL bắt đầu bằng `https://script.google.com/macros/s/...`
- [ ] Đã thay URL vào `chatbot.js` dòng 3
- [ ] Chatbot chat xong, dữ liệu xuất hiện trên Google Sheets
- [ ] Cùng Session ID thì cập nhật gộp chứ không tạo dòng mới
- [ ] Khách "hot" thì email cảnh báo được gửi đi (nhớ đổi `adminEmail` trong Apps Script)
