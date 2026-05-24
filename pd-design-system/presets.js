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

  // Export to global scope
  global.PDPresets = presets;

  // Auto-init theme and click ripple on DOM content loaded
  document.addEventListener('DOMContentLoaded', () => {
    presets.initTheme();
    presets.initLiquidClicks();
  });

})(window);
