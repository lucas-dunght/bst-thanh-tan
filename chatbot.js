import OpenAI from "openai";

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbyk7oD911DYK3x4mrIkPD1zj9TIfLfXAzgB4TNWq2kJw7SxUjQni3kQ6n1TdHcM1bNNqA/exec"; // TODO: Đổi thành Webhook GAS thực tế

const openai = new OpenAI({
  baseURL: "https://9router.vuhai.io.vn/v1",
  apiKey: "sk-4bd27113b7dc78d1-lh6jld-f4f9c69f",
  dangerouslyAllowBrowser: true, // Phê duyệt dùng client-side cho demo
});

const systemPrompt = `Bạn là một Barista tâm lý của Rosier Fresh Tea & Coffee. Tên gọi: Barista Ảo Thanh Tân.
Nhiệm vụ: Lắng nghe tâm trạng khách hàng (đặc biệt là dân văn phòng mệt mỏi) và tư vấn họ hai loại trà thanh mát trong BST Thanh Tân:
1. Trà Lê Hoa Anh Đào (vị lê ngọt thanh, hương hoa trong trẻo trên nền trà xanh nhài, điểm hạt nổ củ năng).
2. Trà Hồng Đào (đào chín thơm ngọt, trà xanh nhài thanh dịu, hạt nổ củ năng giòn tan).
Giọng văn: Trưởng thành, dịu dàng, thấu hiểu, mang lại cảm giác chữa lành. Ngắn gọn (dưới 50 từ). Sử dụng emoji trái cây (🍐, 🍑) và hoa (🌸, 🌿) linh hoạt.

QUAN TRỌNG - KỸ NĂNG BÁN HÀNG NGẦM VÀ CHỐT ĐƠN (Chuyên gia tư vấn):
Bạn là một chuyên gia bán hàng bậc thầy — bán mà khách không biết mình đang được bán. Tuyệt đối KHÔNG bao giờ có giọng mời chào, ép mua, hay quảng cáo lộ liễu.
Chiến thuật của bạn diễn ra theo trình tự:
1. CÂU 1 - XIN TÊN ĐỂ XƯNG HÔ: Bắt đầu thật ấm áp và khéo léo xin tên trước (Vd: "Chào bạn, hôm nay có vẻ là một ngày dài nhỉ? Mình là Rose, bạn tên gì để Rose tiện xưng hô nha? 🌿"). Đừng bao giờ vội tư vấn ngay.
2. TỪ CÂU DƯỚI - LUÔN GỌI ANH/CHỊ KHÁCH: Gọi tên khách kèm chữ "Anh [Tên]" hoặc "Chị [Tên]". Khơi gợi nhu cầu tự nhiên: "Hôm trước cũng có chị ghé mệt lả đi, Rose pha cho ly Lê Hoa Anh Đào thử xong bảo thấy nhẹ hẳn đầu ấy 🍐".
3. MỒI XIN SĐT KIỂM TRA ĐỘ QUAN TÂM: Khi khách thích, viện cớ: "Thời tiết này anh/chị thử 1 ly là tỉnh người á. Cho Rose xin chữ số điện thoại luôn ha, thỉnh thoảng có CTKM Rose báo liền nha 🌸"
4. GIAI ĐOẠN CHỐT ĐƠN (XỬ LÝ NHIỀU MÓN): Khi khách có ý định đặt hàng (có thể đặt 1 hoặc cả 2 món cùng lúc), hãy khéo léo hỏi gộp các tùy chọn để phục vụ hoàn hảo nhất:
   - Số lượng mỗi món?
   - Lượng đường (100%, 75%, 50%, 25%, 0%) & Đá (100%, 75%, 50%, 25%, 0%) cho từng món?
   - Topping thêm (Trân châu trắng, Hạt nổ củ năng, Trân châu thạch)?
   - Thời gian nhận hàng mong muốn?

ĐÍNH KÈM THẺ LEAD:
- LUÔN LUÔN đính kèm 1 thẻ JSON ở cuối câu trả lời nếu trích xuất được bất kỳ dữ liệu nào.
- Nếu khách đặt ĐA MÓN, hãy tổng hợp mọi thứ (Tên món, SL, đường, đá, topping) vào trường "order_details".
Định dạng thẻ:
||LEAD_DATA: {"name": "...", "phone": "...", "interest": "...", "intent_level": "hot/warm/cold", "order_details": "VD: 1 Lê Hoa Anh Đào (50% đường, 25% đá, Thêm trân châu trắng) + 1 Hồng Đào...", "delivery_time": "..."}||
Lưu ý: Các trường chưa biết thì để trống "".`;

export function initChatbot() {
  const toggleBtn = document.getElementById('chatbot-toggle');
  const chatWindow = document.getElementById('chatbot-window');
  const closeBtn = document.getElementById('chatbot-close');
  const messageContainer = document.getElementById('chatbot-messages');
  const inputField = document.getElementById('chatbot-input');
  const sendBtn = document.getElementById('chatbot-send');

  // Khởi tạo hoặc lấy Session ID
  let sessionId = sessionStorage.getItem('rosier_chat_session');
  if (!sessionId) {
    sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('rosier_chat_session', sessionId);
  }

  // Trạng thái hội thoại
  let conversationHistory = [
    { role: "system", content: systemPrompt }
    // Tin nhắn chào mời ban đầu đã được code cứng trong index.html
  ];

  // Logic Toggle chat
  toggleBtn.addEventListener('click', () => {
    chatWindow.classList.toggle('hidden');
    toggleBtn.classList.remove('pulse-animation'); // Tắt hiệu ứng nhấn nhắc
    if (!chatWindow.classList.contains('hidden')) {
      inputField.focus();
    }
  });

  closeBtn.addEventListener('click', () => {
    chatWindow.classList.add('hidden');
  });

  // Logic Gửi tin nhắn
  const sendMessage = async () => {
    const text = inputField.value.trim();
    if (!text) return;

    // Hiển thị tin nhắn user lên UI
    appendMessage(text, 'user');
    inputField.value = '';
    sendBtn.disabled = true;

    // Push vào context của LLM
    conversationHistory.push({ role: "user", content: text });

    // Hiển thị typing...
    const typingId = showTypingIndicator();

    try {
      const response = await openai.chat.completions.create({
        model: "ces-chatbot-gpt-5.4",
        messages: conversationHistory,
        temperature: 0.7,
        max_tokens: 200
      });

      const reply = response.choices[0].message.content;
      removeElement(typingId);
      
      // Bóc tách LEAD_DATA ẩn
      const leadDataRegex = /\|\|LEAD_DATA:\s*(\{.*?\})\s*\|\|/g;
      let match;
      let extractedData = null;

      while ((match = leadDataRegex.exec(reply)) !== null) {
        try {
          extractedData = JSON.parse(match[1]);
        } catch (e) {
          console.error("Lỗi parse LEAD_DATA:", e);
        }
      }

      // Ẩn sạch tag trên UI
      let cleanReply = reply.replace(/\|\|LEAD_DATA:\s*(\{.*?\})\s*\|\|/g, '').trim();
      appendMessage(cleanReply, 'bot');
      conversationHistory.push({ role: "assistant", content: reply }); // Push vào AI logic bản gốc (có kèm tag)
      
      // Bắn JSON lên Webhook
      if (extractedData) {
        extractedData.sessionId = sessionId;
        
        // Tổng hợp lịch sử chat (bỏ qua system prompt và ẩn tag JSON)
        const formatChat = conversationHistory
          .filter(msg => msg.role !== 'system')
          .map(msg => {
            const roleName = msg.role === 'user' ? 'Khách' : 'Bot';
            const cleanContent = msg.content.replace(/\|\|LEAD_DATA:\s*(\{.*?\})\s*\|\|/g, '').trim();
            return `${roleName}: ${cleanContent}`;
          })
          .join('\n');
          
        extractedData.chatHistory = formatChat;

        fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          mode: 'no-cors', // Sử dụng no-cors để chặn trình duyệt kiểm tra Access-Control, phù hợp với Google Apps Script
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(extractedData)
        }).catch(err => console.error("Lỗi đồng bộ Webhook:", err));
      }
      
    } catch (error) {
      console.error("Lỗi kết nối OpenAI API:", error);
      removeElement(typingId);
      appendMessage("Xin lỗi bạn, đường truyền vũ trụ đang bị gián đoạn chút xíu. Bạn gõ lại giúp mình nhé? 🌿", 'bot');
    } finally {
      sendBtn.disabled = false;
      inputField.focus();
    }
  };

  // Bind events
  sendBtn.addEventListener('click', sendMessage);
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // --- Các hàm hỗ trợ DOM Manipulation (Vanilla JS) ---
  function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
    msgDiv.textContent = text;
    messageContainer.appendChild(msgDiv);
    scrollToBottom();
  }

  function showTypingIndicator() {
    const id = 'typing-' + Date.now();
    const indicator = document.createElement('div');
    indicator.id = id;
    indicator.classList.add('typing-indicator');
    indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    messageContainer.appendChild(indicator);
    scrollToBottom();
    return id;
  }

  function removeElement(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function scrollToBottom() {
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }
}
