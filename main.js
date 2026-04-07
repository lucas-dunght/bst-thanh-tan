import './style.css';
import { initChatbot } from './chatbot.js';

// Init Chatbot
initChatbot();

// Intersection Observer for Scroll Animations
document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  
  // 1. Logic Fade in Text (Chữ mờ dần khi cuộn tới)
  const fadeElements = document.querySelectorAll('.fade-text');

  const appearOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px" // Bắt đầu khi element chiếm một phần của viewport
  };

  const appearOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // Cho qua 1 lần (lazy loading), ngừng theo dõi element đó
        observer.unobserve(entry.target);
      }
    });
  }, appearOptions);

  fadeElements.forEach(el => {
    appearOnScroll.observe(el);
  });

  // 2. Logic Background Color Scroll (Từ Xám u tối -> Hồng trong trẻo)
  const transitionSection = document.getElementById('transition-section');
  const productsSection = document.getElementById('products-section');

  const colorOptions = {
    // Ngưỡng 0.3 nghĩalà 30% element lộ ra
    threshold: 0.3
  };

  const bgScrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Cuộn hướng xuống các phần có màu sáng
        if (entry.target.id === 'transition-section' || entry.target.id === 'products-section') {
           root.style.setProperty('--bg-current', 'var(--color-light-pink)');
           root.style.setProperty('--text-current', 'var(--color-text-dark)');
        }
      } else {
        // Nếu thoát khỏi khung này (cụ thể là ngược về Hero)
        if (entry.target.id === 'transition-section' && entry.boundingClientRect.y > 0) {
           root.style.setProperty('--bg-current', 'var(--color-grey-dark)');
           root.style.setProperty('--text-current', 'var(--color-text-light)');
        }
      }
    });
  }, colorOptions);

  if (transitionSection) {
    bgScrollObserver.observe(transitionSection);
  }
  if (productsSection) {
    bgScrollObserver.observe(productsSection);
  }
});
