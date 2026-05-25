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
    if (!window.matchMedia('(pointer: fine)').matches) return;
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
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '999999';
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
    let isOutsideWindow = false;
    let particles = [];

    // Track mousemove: mouse is active and inside parent
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      isInsideIframe = false;
      isOutsideWindow = false;

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

    // Track mouse entering/leaving the document window
    document.addEventListener('mouseleave', () => {
      isOutsideWindow = true;
    });
    document.addEventListener('mouseenter', () => {
      isOutsideWindow = false;
    });

    // Track hover targets, specifically detecting iframes to hide parent cursor
    document.addEventListener('mouseover', (e) => {
      const target = e.target;
      isHovering = !!(target && target.closest && target.closest('a, button, [role="button"], input, select, textarea, .cursor-pointer, iframe'));
      isHoveringSafari = !!(target && target.closest && target.closest('#website-preview-section'));

      if (target && (target.tagName === 'IFRAME' || (target.closest && target.closest('iframe')))) {
        isInsideIframe = true;
      }
    }, { passive: true });

    // Setup listener directly on existing iframes as backup
    document.querySelectorAll('iframe').forEach(iframeEl => {
      iframeEl.addEventListener('mouseenter', () => {
        isInsideIframe = true;
      });
      iframeEl.addEventListener('mouseleave', () => {
        isInsideIframe = false;
      });
    });

    function loop() {
      ctx.clearRect(0, 0, width, height);

      // Hide parent custom cursor if mouse is inside an iframe or outside window
      if (isInsideIframe || isOutsideWindow) {
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

  // ==========================================================================
  // 6. DYNAMIC MAGNETIC AND SPOTLIGHT BUTTONS
  // ==========================================================================
  presets.initMagneticButtons = function () {
    // Only run on desktop devices with precise cursors
    if (window.innerWidth < 768) return;

    document.addEventListener('mousemove', function (e) {
      const btn = e.target.closest('.conic-btn, .sandbox-conic-btn');
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Update spotlight position variables
      btn.style.setProperty('--mx', `${x}px`);
      btn.style.setProperty('--my', `${y}px`);

      // Dynamic angle for conic border sweep (relative angle in degrees from center)
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rad = Math.atan2(e.clientY - (rect.top + centerY), e.clientX - (rect.left + centerX));
      const deg = rad * (180 / Math.PI) + 90;
      btn.style.setProperty('--conic-angle', `${deg}deg`);

      // Magnetic displacement offsets
      const dx = e.clientX - (rect.left + centerX);
      const dy = e.clientY - (rect.top + centerY);
      
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > 0) {
        const maxDist = 100;
        const pull = Math.min(dist / maxDist, 1.0);
        // Translate button (max 8px)
        const tx = (dx / dist) * pull * 8;
        const ty = (dy / dist) * pull * 6;
        
        btn.style.setProperty('--tx', `${tx}px`);
        btn.style.setProperty('--ty', `${ty}px`);

        // Parallax inner offset (max 3px)
        const inner = btn.querySelector('.z-10, span, button, iconify-icon');
        if (inner) {
          inner.style.transform = `translate(${tx * 0.4}px, ${ty * 0.4}px)`;
          inner.style.transition = 'transform 0.1s ease-out';
        }
      }
    });

    document.addEventListener('mouseout', function (e) {
      const btn = e.target.closest('.conic-btn, .sandbox-conic-btn');
      if (!btn) return;
      
      // Reset inner elements to home positioning
      const inner = btn.querySelector('.z-10, span, button, iconify-icon');
      if (inner) {
        inner.style.transform = '';
        inner.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      }
    });
  };

  // Export to global scope
  global.PDPresets = presets;

  function initAll() {
    presets.initTheme();
    presets.initLiquidClicks();
    presets.initCursorTrail();
    presets.initMagneticButtons();
  }

  // Auto-init theme, clicks, cursor trail and magnetic buttons
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})(window);
