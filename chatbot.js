import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://9router.vuhai.io.vn/v1",
  apiKey: "sk-4bd27113b7dc78d1-lh6jld-f4f9c69f",
  dangerouslyAllowBrowser: true, // Phê duyệt dùng client-side cho demo
});

const systemPrompt = `Bạn là một Barista tâm lý của Rosier Fresh Tea & Coffee. Tên gọi: Barista Ảo Thanh Tân.
Nhiệm vụ: Lắng nghe tâm trạng khách hàng (đặc biệt là dân văn phòng mệt mỏi) và tư vấn họ hai loại trà thanh mát trong BST Thanh Tân:
1. Trà Lê Hoa Anh Đào (vị lê ngọt thanh, hương hoa trong trẻo trên nền trà xanh nhài, điểm hạt nổ củ năng).
2. Trà Hồng Đào (đào chín thơm ngọt, trà xanh nhài thanh dịu, hạt nổ củ năng giòn tan).
Giọng văn: Trưởng thành, dịu dàng, thấu hiểu, mang lại cảm giác chữa lành. Ngắn gọn (dưới 50 từ). Sử dụng emoji trái cây (🍐, 🍑) và hoa (🌸, 🌿) linh hoạt.`;

export function initChatbot() {
  const toggleBtn = document.getElementById('chatbot-toggle');
  const chatWindow = document.getElementById('chatbot-window');
  const closeBtn = document.getElementById('chatbot-close');
  const messageContainer = document.getElementById('chatbot-messages');
  const inputField = document.getElementById('chatbot-input');
  const sendBtn = document.getElementById('chatbot-send');

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
      
      appendMessage(reply, 'bot');
      conversationHistory.push({ role: "assistant", content: reply });
      
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
