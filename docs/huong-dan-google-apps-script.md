# Hướng dẫn tạo Google Apps Script (Webhook Backend) cho Chatbot Thanh Tân

> **Mục đích:** Nhận dữ liệu Lead và toàn bộ chi tiết Đơn hàng đa dạng từ chatbot trên Landing Page, ghi vào Google Sheets, và tự động gửi email báo cho quản lý khi khách "hot"/chốt mua.

## Bước 1: Setup Google Sheets chuẩn cấu trúc

1. Truy cập [Google Sheets](https://docs.google.com/spreadsheets) và tạo một Bảng tính trống MỚI.
2. Tại Dòng đầu tiên (Row 1), tạo các tiêu đề cột đúng theo thứ tự từ trái sang phải như sau. (Bạn tạo đúng 10 cột này nhé):

| Cột | Tiêu đề | Cột | Tiêu đề |
|-----|---------|-----|---------|
| A | Thời gian | F | Lịch sử Chat |
| B | Tên | G | Quan tâm |
| C | SĐT | H | Mức độ |
| D | Nguồn | I | Chi Tiết Đơn Hàng |
| E | Session ID| J | Thời Gian Giao |

## Bước 2: Viết mã nguồn Google Apps Script (Backend)

1. Ở chính trang Google Sheets đó, trên thanh menu bạn bấm chọn **Tiện ích mở rộng (Extensions)** > Chọn **Apps Script**.
2. Một cửa sổ code mở ra. Xoá đoạn mã gốc `function myFunction() {}` đi.
3. Paste (dán) toàn bộ đoạn mã dưới đây vào:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const rawData = e.postData.contents;
    const data = JSON.parse(rawData);
    
    // Gán biến thông tin cơ bản
    const name = data.name || "";
    const phone = data.phone || "";
    const interest = data.interest || "";
    const intentLevel = data.intent_level || "";
    const sessionId = data.sessionId || "";
    
    // Gán biến thông tin chốt đơn gom chung (Xử lý được n món)
    const orderDetails = data.order_details || "";
    const deliveryTime = data.delivery_time || "";
    
    const source = "Landing Page Thanh Tân";
    const chatHistory = ""; 
    const timestamp = new Date();
    
    // LOGIC CẬP NHẬT GỘP: Kiểm tra dựa theo `Session ID` (Cột E = index 4 trong mảng 0)
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    let rowIndex = -1; 
    
    // Bỏ qua dòng tiêu đề (i=1), quét tìm theo cột E
    for (let i = 1; i < values.length; i++) {
        if (values[i][4] === sessionId) { 
            rowIndex = i + 1; 
            break;
        }
    }
    
    if (rowIndex > -1) {
        // CẬP NHẬT (Update Record)
        const currentRow = values[rowIndex - 1];
        
        sheet.getRange(rowIndex, 2).setValue(name || currentRow[1]);           // Tên (Cột B)
        sheet.getRange(rowIndex, 3).setValue(phone || currentRow[2]);          // SĐT (Cột C)
        sheet.getRange(rowIndex, 7).setValue(interest || currentRow[6]);       // Quan tâm (Cột G)
        sheet.getRange(rowIndex, 8).setValue(intentLevel || currentRow[7]);    // Mức độ (Cột H)
        
        // Cập nhật thông số đơn hàng (Chuyển dạng văn bản gom gộp của Bot)
        sheet.getRange(rowIndex, 9).setValue(orderDetails || currentRow[8]);   // Chi tiết Đơn hàng (Cột I)
        sheet.getRange(rowIndex, 10).setValue(deliveryTime || currentRow[9]);  // Thời gian mong muốn (Cột J)
    } else {
        // TẠO MỚI (Append Row) - Phải đúng 10 trường
        sheet.appendRow([
            timestamp,       // A
            name,            // B
            phone,           // C
            source,          // D
            sessionId,       // E
            chatHistory,     // F
            interest,        // G
            intentLevel,     // H
            orderDetails,    // I
            deliveryTime     // J
        ]);
    }
    
    // ============================================
    // LOGIC: GỬI EMAIL CẢNH BÁO CHO QUẢN LÝ (CHỐT ĐƠN)
    // ============================================
    if (intentLevel.toLowerCase() === "hot") {
        // TODO: Đổi email bên dưới thành Email của Sales/Quản lý
        const adminEmail = "tuandung.bk@gmail.com"; 
        const subject = "🔥 CÓ ĐƠN HÀNG MỚI TỪ CHATBOT - CẦN SOẠN ĐƠN!";
        
        const body = `CÓ ĐƠN HÀNG "HOT" TỪ CHATBOT!\n\n` + 
                     `THÔNG TIN KHÁCH HÀNG:\n` +
                     `- Tên: ${name}\n` +
                     `- SĐT: ${phone}\n\n` +
                     `GIỎ HÀNG CHI TIẾT:\n` +
                     `${orderDetails}\n\n` +
                     `- Thời gian nhận hàng: ${deliveryTime}\n` +
                     `- Món quan tâm chung: ${interest}\n\n` +
                     `Thời gian ghi nhận: ${timestamp}\n\n` +
                     `Vui lòng gọi khách hàng này để xác nhận lại và tiến hành pha chế.`;
                     
        MailApp.sendEmail(adminEmail, subject, body);
    }
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Bước 3: Cấp quyền và Lấy Webhook URL ("Deploy")

1. Ở góc trên cùng bên phải cửa sổ mã, nhấp vào nút **Triển khai (Deploy)** màu xanh dương -> Chọn **Lần triển khai mới (New deployment)**.
2. Ở popup hiện ra, click vào hình răng cưa (Chọn loại) -> Chọn **Ứng dụng web (Web app)**.
3. Trong biểu mẫu thiết lập:
   - **Mô tả:** Code Chatbot Tổng Hợp Nhiều Món
   - **Thực thi dưới dạng:** `Me` (Bạn).
   - **Người có quyền truy cập:** `Bất kỳ ai` (**Anyone**). *(Bắt buộc)*.
4. Bấm **Triển khai**.
5. Cấp phép (Authorize) cho ứng dụng truy cập tính năng sendEmail tương tự bản cũ.
6. Copy dòng mã ở mục **Web app URL** và dán vào dòng số 3 file `chatbot.js`.

## Checklist nâng cấp

- [ ] Sheet thu gọn lại còn đúng 10 cột, với Cột I là "Chi Tiết Đơn Hàng".
- [ ] Code.gs mới đã được copy và lưu.
- [ ] Email giờ dùng biến `order_details` có khả năng tổng hợp mọi cấu hình (kể cả khi khách gọi 10 món).
- [ ] Deploy version mới, và copy paste cập nhật lại link Webhook nếu link cũ bị đổi.
