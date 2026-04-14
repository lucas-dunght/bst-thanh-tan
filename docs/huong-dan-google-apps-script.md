# Hướng dẫn tạo Google Apps Script (Webhook Backend) cho Chatbot Thanh Tân

> **Mục đích:** Nhận dữ liệu Lead và Đơn hàng chi tiết từ chatbot trên Landing Page, ghi vào Google Sheets, và tự động gửi email báo cho quản lý khi phát hiện khách chốt đơn ("hot").

## Bước 1: Setup Google Sheets chuẩn cấu trúc

1. Truy cập [Google Sheets](https://docs.google.com/spreadsheets) và tạo một Bảng tính trống MỚI.
2. Tại Dòng đầu tiên (Row 1), tạo các tiêu đề cột đúng theo thứ tự từ trái sang phải như sau. (Bạn tạo đúng 13 cột này nhé):

| Cột | Tiêu đề | Cột | Tiêu đề |
|-----|---------|-----|---------|
| A | Thời gian | H | Mức độ |
| B | Tên | I | Số lượng |
| C | SĐT | J | Giao hàng |
| D | Nguồn | K | Đường |
| E | Session ID| L | Đá |
| F | Lịch sử Chat| M | Topping |
| G | Quan tâm | | |

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
    
    // Gán biến thông tin chốt đơn (Mô-đun mới)
    const quantity = data.quantity || "";
    const deliveryTime = data.delivery_time || "";
    const sugar = data.sugar || "";
    const ice = data.ice || "";
    const topping = data.topping || "";
    
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
        
        sheet.getRange(rowIndex, 2).setValue(name || currentRow[1]);         // Tên (Cột B)
        sheet.getRange(rowIndex, 3).setValue(phone || currentRow[2]);        // SĐT (Cột C)
        sheet.getRange(rowIndex, 7).setValue(interest || currentRow[6]);     // Quan tâm (Cột G)
        sheet.getRange(rowIndex, 8).setValue(intentLevel || currentRow[7]);  // Mức độ (Cột H)
        
        // Cập nhật thông số đơn hàng
        sheet.getRange(rowIndex, 9).setValue(quantity || currentRow[8]);       // Số lượng (Cột I)
        sheet.getRange(rowIndex, 10).setValue(deliveryTime || currentRow[9]);  // Giao hàng (Cột J)
        sheet.getRange(rowIndex, 11).setValue(sugar || currentRow[10]);        // Đường (Cột K)
        sheet.getRange(rowIndex, 12).setValue(ice || currentRow[11]);          // Đá (Cột L)
        sheet.getRange(rowIndex, 13).setValue(topping || currentRow[12]);      // Topping (Cột M)
    } else {
        // TẠO MỚI (Append Row) - Phải đúng 13 trường
        sheet.appendRow([
            timestamp,     // A
            name,          // B
            phone,         // C
            source,        // D
            sessionId,     // E
            chatHistory,   // F
            interest,      // G
            intentLevel,   // H
            quantity,      // I
            deliveryTime,  // J
            sugar,         // K
            ice,           // L
            topping        // M
        ]);
    }
    
    // ============================================
    // LOGIC: GỬI EMAIL CẢNH BÁO CHO QUẢN LÝ (CHỐT ĐƠN)
    // ============================================
    if (intentLevel.toLowerCase() === "hot") {
        // TODO: Đổi email bên dưới thành Email của Sales/Quản lý
        const adminEmail = "email-cua-ban@gmail.com"; 
        const subject = "🔥 CÓ ĐƠN HÀNG MỚI TỪ CHATBOT - CẦN SOẠN ĐƠN!";
        
        const body = `CÓ ĐƠN HÀNG "HOT" TỪ CHATBOT!\n\n` + 
                     `THÔNG TIN KHÁCH HÀNG:\n` +
                     `- Tên: ${name}\n` +
                     `- SĐT: ${phone}\n\n` +
                     `CHI TIẾT ĐƠN HÀNG:\n` +
                     `- Món quan tâm: ${interest}\n` +
                     `- Số lượng: ${quantity}\n` +
                     `- Mức Đường: ${sugar}\n` +
                     `- Mức Đá: ${ice}\n` +
                     `- Topping: ${topping}\n` +
                     `- Thời gian nhận hàng: ${deliveryTime}\n\n` +
                     `Thời gian ghi nhận: ${timestamp}\n\n` +
                     `Vui lòng gọi khách hàng này để xác nhận và pha chế ngay.`;
                     
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
   - **Mô tả:** Code Chatbot v2 Chốt Đơn
   - **Thực thi dưới dạng:** `Me` (Bạn).
   - **Người có quyền truy cập:** `Bất kỳ ai` (**Anyone**). *(Bắt buộc)*.
4. Bấm **Triển khai**.
5. Cấp phép (Authorize) cho ứng dụng truy cập tính năng sendEmail tương tự bản cũ.
6. Copy dòng mã ở mục **Web app URL** và dán vào dòng số 3 file `chatbot.js`.

## Checklist nâng cấp

- [ ] Sheet đã có tổng cộng 13 cột.
- [ ] Code.gs mới đã được Dán và Save lại.
- [ ] Đã Deploy thành URL mới (hoặc update phiên bản cũ) và bỏ vào `chatbot.js`.
- [ ] Khách mồi chốt đơn sẽ kích hoạt gửi mail chi tiết công thức đường, đá, topping đến tận hòm thư của bạn!
