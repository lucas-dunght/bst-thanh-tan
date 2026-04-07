import './style.css';
import { initChatbot } from './chatbot.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Init Chatbot
initChatbot();

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  
  // 1. Logic Hiện chữ Cinematic (GSAP Text Reveal)
  gsap.utils.toArray('.fade-text').forEach((el) => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none reverse"
      },
      y: 40,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    });
  });

  // 2. Logic Parallax hình ảnh (Image Scroll Effect)
  gsap.utils.toArray('.product-img-wrapper img').forEach((img) => {
    gsap.fromTo(img, 
      { y: -30, scale: 1.15 },
      { 
        y: 30, 
        scale: 1, 
        ease: "none",
        scrollTrigger: {
          trigger: img.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      }
    );
  });

  // 3. Logic chuyển màu nền (Transition-section -> Products)
  ScrollTrigger.create({
    trigger: '#transition-section',
    start: "top 60%", // Khi transition section đi vào vùng xem
    onEnter: () => {
      root.style.setProperty('--bg-current', 'var(--color-light-pink)');
      root.style.setProperty('--text-current', 'var(--color-text-dark)');
    },
    onLeaveBack: () => {
      // Khi quay ngược màn hình về phần Hero Banner ban đầu
      root.style.setProperty('--bg-current', 'var(--color-grey-dark)');
      root.style.setProperty('--text-current', 'var(--color-text-light)');
    }
  });
});
