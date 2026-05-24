/**
 * Project D Design System - UI Presets (presets.js)
 * Version: 1.0.0
 * Author: Antigravity AI
 * Description: Interactive behaviors, animations, theme toggles, and liquid ripple triggers.
 */

(function (global) {
  'use strict';

  const presets = {};

  // ==========================================================================
  // 1. THEME MANAGEMENT (LIGHT/DARK)
  // ==========================================================================
  
  presets.initTheme = function () {
    const isDark = 
      localStorage.theme === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Sync any standard elements like icons or active widgets
    presets.updateThemeToggles();
  };

  presets.toggleTheme = function () {
    const html = document.documentElement;
    const isCurrentlyDark = html.classList.contains('dark');
    
    if (isCurrentlyDark) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    
    presets.updateThemeToggles();
    
    // Dispatch custom event for custom components/iframes to listen to
    window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme: isCurrentlyDark ? 'light' : 'dark' } }));
  };

  presets.updateThemeToggles = function () {
    const isDark = document.documentElement.classList.contains('dark');
    // Look for standard sun/moon icons on the page and make sure they toggle display appropriately
    document.querySelectorAll('.sun-icon').forEach(el => {
      el.style.display = isDark ? 'none' : 'block';
    });
    document.querySelectorAll('.moon-icon').forEach(el => {
      el.style.display = isDark ? 'block' : 'none';
    });
  };


  // ==========================================================================
  // 2. LIQUID CLICK RIPPLE EFFECT
  // ==========================================================================
  
  presets.initLiquidClicks = function () {
    document.addEventListener('click', function (e) {
      // Avoid spawning ripples on non-interactive regions if desired, 
      // but standard is running globally. Check for interactive target or container.
      const ripple = document.createElement('div');
      ripple.className = 'liquid-click-effect';
      
      // Center the ripple on the click coordinates
      ripple.style.left = e.clientX + 'px';
      ripple.style.top = e.clientY + 'px';
      
      document.body.appendChild(ripple);
      
      // Cleanup after animation completes
      ripple.addEventListener('animationend', function () {
        ripple.remove();
      });
    }, { passive: true });
  };


  // ==========================================================================
  // 3. SCROLL REVEAL TRIGGERS
  // ==========================================================================
  
  presets.initScrollReveal = function (selector = '.animate-on-scroll') {
    if (!window.IntersectionObserver) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate', 'reveal-visible');
        } else {
          // Optional: remove if you want scroll reveal to trigger multiple times
          // entry.target.classList.remove('animate', 'reveal-visible');
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    
    document.querySelectorAll(selector).forEach((el) => {
      // Pause animations initially
      el.style.animationPlayState = 'paused';
      observer.observe(el);
    });
    
    // Dynamically play animation when class is added
    const style = document.createElement('style');
    style.textContent = `
      ${selector} { animation-play-state: paused !important; }
      ${selector}.animate { animation-play-state: running !important; }
    `;
    document.head.appendChild(style);
  };


  // ==========================================================================
  // 4. CLIPBOARD COPY UTILITIES
  // ==========================================================================
  
  presets.copyText = function (text, buttonElement) {
    navigator.clipboard.writeText(text).then(() => {
      if (buttonElement) {
        const originalContent = buttonElement.innerHTML;
        buttonElement.classList.add('copied');
        buttonElement.innerHTML = '<iconify-icon icon="solar:check-circle-bold" width="14"></iconify-icon> Copied!';
        
        setTimeout(() => {
          buttonElement.classList.remove('copied');
          buttonElement.innerHTML = originalContent;
        }, 2000);
      }
    }).catch(err => {
      console.error('Failed to copy code: ', err);
    });
  };
  
  // ==========================================================================
  // 5. GLOBAL CURSOR TRAIL
  // ==========================================================================
  presets.initCursorTrail = function () {
    if (window.innerWidth < 768) return;
    const existingCanvas = document.getElementById('cursor-trail');
    if (existingCanvas) existingCanvas.remove();

    const style = document.createElement('style');
    style.textContent = `
      @media (pointer: fine) {
        body, a, button, [role="button"], input, select, textarea, .cursor-pointer {
          cursor: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    const canvas = document.createElement('canvas');
    canvas.id = 'cursor-trail';
    canvas.className = 'fixed inset-0 pointer-events-none z-[10000]';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    window.addEventListener('resize', () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    });

    let mouse = { x: -100, y: -100 };
    let isHovering = false;
    let isHoveringSafari = false;
    let isInsideIframe = false;
    let particles = [];

    const iframeEl = document.getElementById('medspa-iframe');
    if (iframeEl) {
      iframeEl.addEventListener('mouseenter', () => isInsideIframe = true);
      iframeEl.addEventListener('mouseleave', () => isInsideIframe = false);
    }

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (isHoveringSafari) {
        const isLight = !document.documentElement.classList.contains('dark');
        const colorA = isLight ? '212, 140, 148' : '255, 230, 235';
        const colorB = isLight ? '180, 120, 130' : '255, 246, 245';

        if (Math.random() > 0.3) {
          particles.push({
            x: mouse.x + (Math.random() - 0.5) * 12,
            y: mouse.y + (Math.random() - 0.5) * 12,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 1) * 0.5,
            life: 1,
            size: Math.random() * 1.5 + 0.5,
            color: Math.random() > 0.5 ? colorA : colorB
          });
        }
      }
    }, { passive: true });

    document.addEventListener('mouseover', (e) => {
      isHovering = !!(e.target && e.target.closest && e.target.closest('a, button, [role="button"], input, select, textarea, .cursor-pointer, iframe'));
      isHoveringSafari = !!(e.target && e.target.closest && e.target.closest('#website-preview-section'));
    }, { passive: true });

    function loop() {
      ctx.clearRect(0, 0, width, height);

      if (isInsideIframe) {
        for (let i = particles.length - 1; i >= 0; i--) {
          let p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.015;
          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color}, ${p.life})`;
          ctx.shadowBlur = 6;
          ctx.shadowColor = `rgba(${p.color}, ${p.life * 0.5})`;
          ctx.fill();
        }
        requestAnimationFrame(loop);
        return;
      }

      if (isHoveringSafari) {
        const isLight = !document.documentElement.classList.contains('dark');

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, isHovering ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? 'rgba(212, 140, 148, 0.9)' : 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = 12;
        ctx.shadowColor = isLight ? 'rgba(212, 140, 148, 0.6)' : 'rgba(255, 230, 235, 0.8)';
        ctx.fill();

        for (let i = particles.length - 1; i >= 0; i--) {
          let p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.015;
          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color}, ${p.life})`;
          ctx.shadowBlur = 6;
          ctx.shadowColor = `rgba(${p.color}, ${p.life * 0.5})`;
          ctx.fill();
        }
      } else {
        const isDark = document.documentElement.classList.contains('dark');
        const color = isDark ? '70, 212, 198' : '255, 145, 70';

        ctx.save();
        ctx.translate(mouse.x, mouse.y);
        if (isHovering) {
          ctx.scale(1.1, 1.1);
        }
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(14, 14);
        ctx.lineTo(6, 14);
        ctx.lineTo(0, 20);
        ctx.closePath();

        ctx.fillStyle = isHovering ? `rgb(${color})` : '#ffffff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(${color}, 0.6)`;
        ctx.fill();

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = isHovering ? '#ffffff' : (isDark ? '#000000' : '#1e293b');
        ctx.shadowBlur = 0;
        ctx.stroke();

        ctx.restore();
      }

      requestAnimationFrame(loop);
    }
    loop();
  };

  // Export to global scope
  global.PDPresets = presets;

  function initAll() {
    presets.initTheme();
    presets.initLiquidClicks();
    presets.initCursorTrail();
  }

  // Auto-init theme, clicks and cursor trail
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})(window);
