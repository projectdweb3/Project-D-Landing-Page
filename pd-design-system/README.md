# Project D UI Presets & Design System

Welcome to the branded UI Presets library for Project D. This folder acts as the single source of truth for keeping all pages consistent, modern, and aligned with our **Liquid Glass** aesthetic.

---

## 🚀 How to Use in a Page

To implement Project D branding on any new or existing HTML page, import the compiled presets in the `<head>` tag:

```html
<!-- Google Fonts (Inter) -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

<!-- Iconify for Vector Icons -->
<script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>

<!-- Project D Presets CSS & JS -->
<link rel="stylesheet" href="pd-design-system/presets.css" />
<script src="pd-design-system/presets.js"></script>
```

---

## 🎨 Brand Component Presets & Nomenclature

When pair-programming, you can quickly ask me to implement or build using the following preset names:

### 1. `PD Conic Pill Teal Button` (Primary Action)
* **Description**: A pill-shaped button with the spinning white-and-teal conic border glow on hover.
* **Code Snippet**:
```html
<button class="conic-btn primary dramatic-hover">
  <div class="conic-spin-bg"></div>
  <div class="conic-btn-mask"></div>
  <span class="relative z-10 flex items-center gap-1.5">
    <iconify-icon icon="solar:add-circle-linear" width="16"></iconify-icon>
    <span>Add User</span>
  </span>
</button>
```

### 2. `PD Conic Pill Orange Button` (Primary Highlight)
* **Description**: A pill button utilizing the secondary warm orange spinning gradient border on hover.
* **Code Snippet**:
```html
<button class="conic-btn orange dramatic-hover">
  <div class="conic-spin-bg"></div>
  <div class="conic-btn-mask"></div>
  <span class="relative z-10 flex items-center gap-1.5">
    <iconify-icon icon="solar:fire-bold" width="16"></iconify-icon>
    <span>Activate AMP</span>
  </span>
</button>
```

### 3. `PD Conic Pill Glass Button` (Secondary Action)
* **Description**: A glass-frosted pill button that displays the multicolor brand border rotation on hover.
* **Code Snippet**:
```html
<button class="conic-btn dramatic-hover">
  <div class="conic-spin-bg"></div>
  <div class="conic-btn-mask"></div>
  <span class="relative z-10 flex items-center gap-1.5">
    <iconify-icon icon="solar:settings-linear" width="16"></iconify-icon>
    <span>Settings</span>
  </span>
</button>
```

### 4. `PD Conic Circle Icon Button` (Compact Control)
* **Description**: Circular layout for theme toggles, close buttons, and mini triggers. Includes conic spin hover.
* **Code Snippet**:
```html
<button class="conic-btn circle dramatic-hover" title="Settings">
  <div class="conic-spin-bg"></div>
  <div class="conic-btn-mask"></div>
  <span class="relative z-10 flex items-center justify-center">
    <iconify-icon icon="solar:settings-bold" width="18"></iconify-icon>
  </span>
</button>
```

### 5. `PD Classic Glass Button` (Default Action)
* **Description**: A standard rounded-full frosted glass button with a subtle horizontal shimmer sweep on hover.
* **Code Snippet**:
```html
<button class="amp-button">
  <iconify-icon icon="solar:import-linear" width="16"></iconify-icon>
  <span>Import Data</span>
</button>
```

### 6. `PD Specular Card` (Standard Card)
* **Description**: The classic Liquid Glass dashboard block. Features top specular edge highlights and scale-up hover feedback.
* **Code Snippet**:
```html
<div class="amp-card p-6">
  <h3 class="text-lg font-bold mb-2">Card Title</h3>
  <p class="text-sm text-slate-500">Card content description goes here.</p>
</div>
```

### 7. `PD Glass Panel` (Structural Container)
* **Description**: Highly frosted glass sheet suitable for sidebars, navigation panels, and table backdrops.
* **Code Snippet**:
```html
<div class="glass-panel p-4 rounded-3xl">
  <!-- Panel Inner elements -->
</div>
```

### 8. `PD Dynamic Island Navigation` (Header Pill)
* **Description**: The floating navigation island from the Home Page. Centered, highly blurred, with theme toggle support.
* **Code Snippet**:
```html
<nav class="dynamic-island">
  <div class="dynamic-island-content">
    <a href="home.html" class="logo-link">
      <img src="logo.png" style="width: 24px; height: 24px; object-fit: contain;" />
    </a>
    <div class="flex gap-4 px-2">
      <a href="home.html" class="text-xs font-semibold">Home</a>
      <a href="amp-center.html" class="text-xs font-semibold">AMP Center</a>
      <a href="docs.html" class="text-xs font-semibold">Docs</a>
    </div>
    <div class="w-px h-4 bg-slate-300 mx-1"></div>
    <button onclick="PDPresets.toggleTheme()" class="btn-theme-toggle">
      <iconify-icon icon="solar:sun-2-bold-duotone" class="sun-icon" style="color: #ff9146;"></iconify-icon>
      <iconify-icon icon="solar:moon-stars-bold-duotone" class="moon-icon" style="color: #46d4c6;"></iconify-icon>
    </button>
  </div>
</nav>
```

### 9. `PD Ambient Background` (Visual Core)
* **Description**: Spawns the rotating soft neon gradient beams in the background. Needs to be placed right after the `<body>` opening tag.
* **Code Snippet**:
```html
<!-- Ambient background structure -->
<div class="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-gray-50 dark:bg-[#070c18]">
  <div class="neon-beam-glow"></div>
  <div class="fixed inset-0 dot-grid-bg opacity-30"></div>
</div>
```

### 10. `PD Agent Glow Badge` (Status Element)
* **Description**: A status pill featuring an active glow ring and capacity pulse animations, matching the AMP Center workforce nodes.
* **Code Snippet**:
```html
<div class="flex items-center gap-2 p-3 bg-white/40 dark:bg-black/20 rounded-xl">
  <div class="relative w-8 h-8 rounded-full border border-[#46d4c6] agent-active-glow" style="color: #46d4c6;">
    <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/8c547aee-5092-488d-9b24-cc3cadf37fdc_320w.png" class="w-full h-full rounded-full" />
  </div>
  <div>
    <div class="text-xs font-bold">SEO Agent</div>
    <div class="text-[10px] text-emerald-500">Active</div>
  </div>
</div>
```

### 11. `PD Conic Agent Avatar` (Visual Element)
* **Description**: Frosted circular avatar with a continuous spinning multicolor conic gradient border sweep.
* **Code Snippet**:
```html
<div class="relative w-14 h-14 rounded-full border border-transparent flex items-center justify-center overflow-hidden">
  <div class="absolute inset-[-200%] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#ff9146_30%,#ffffff_50%,#46d4c6_70%,transparent_100%)] opacity-60 animate-[spin_2.5s_linear_infinite] pointer-events-none"></div>
  <div class="absolute inset-[2.5px] rounded-full bg-white dark:bg-gray-800"></div>
  <iconify-icon icon="solar:crown-minimalistic-bold" class="relative z-10 text-pd-orange text-2xl"></iconify-icon>
</div>
```

### 12. `PD Active Workforce Tree` (Structural Connection)
* **Description**: Structural connection grid elements representing agent hierarchy using `.tree-line-v` and `.tree-line-h` classes.
* **Code Snippet**:
```html
<div class="flex flex-col items-center w-full relative">
  <!-- CEO Node -->
  <div class="amp-card p-3 flex items-center gap-3 w-48 justify-center z-10 bg-white/80 dark:bg-[#0b0f19]">
    <div class="w-8 h-8 rounded-full relative overflow-hidden isolate bg-white/60 dark:bg-gray-800/60 flex items-center justify-center flex-shrink-0">
      <div class="absolute inset-[-200%] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#ff9146_30%,#ffffff_50%,#46d4c6_70%,transparent_100%)] opacity-50 animate-[spin_2s_linear_infinite]"></div>
      <div class="absolute inset-[2px] rounded-full bg-white/90 dark:bg-gray-800/90"></div>
      <iconify-icon icon="solar:crown-minimalistic-linear" width="14" class="text-pd-orange relative z-10"></iconify-icon>
    </div>
    <div>
      <div class="text-[11px] font-semibold">CEO Agent</div>
      <div class="text-[8px] text-emerald-500 font-bold">Active</div>
    </div>
  </div>
  
  <!-- Vertical Connector Line -->
  <div class="tree-line-v h-6 bg-gray-200 dark:bg-white/10 w-[1px]"></div>
  
  <!-- Child Node -->
  <div class="amp-card rounded-xl p-3 flex items-center gap-3 w-48 justify-center z-10 bg-white/80 dark:bg-[#0b0f19]">
    <div class="w-8 h-8 rounded-full relative overflow-hidden isolate bg-white/60 dark:bg-gray-800/60 flex items-center justify-center flex-shrink-0">
      <div class="absolute inset-[-200%] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#46d4c6_30%,#ffffff_50%,#ff9146_70%,transparent_100%)] opacity-40 animate-[spin_3s_linear_infinite]"></div>
      <div class="absolute inset-[2px] rounded-full bg-white/90 dark:bg-gray-800/90"></div>
      <iconify-icon icon="solar:global-linear" width="14" class="text-pd-teal relative z-10"></iconify-icon>
    </div>
    <div>
      <div class="text-[11px] font-semibold">CMO Agent</div>
      <div class="text-[8px] text-gray-500">Marketing</div>
    </div>
  </div>
</div>
```

### 13. `PD Kingdom Onboarding Card` (Onboarding Component)
* **Description**: Dual-gradient border wrap card containing form elements and circular conic-glow hover arrow triggers.
* **Code Snippet**:
```html
<div class="relative rounded-[2rem] p-[1px] bg-gradient-to-b from-gray-200 dark:from-gray-700 via-transparent to-transparent w-full overflow-hidden shadow-xl">
  <div class="absolute inset-[1px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[calc(2rem-1px)]"></div>
  <div class="relative z-10 p-6 flex flex-col items-center">
    <h4 class="text-sm font-bold text-gray-900 dark:text-white">Describe your digital kingdom...</h4>
    <div class="w-full flex gap-2 items-center mt-4">
      <input type="text" class="w-full bg-white/60 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-full px-4 py-2 text-xs" placeholder="e.g. A marketing agency..." />
      <button class="group w-8 h-8 rounded-full relative overflow-hidden isolate dramatic-hover flex items-center justify-center bg-white/60 dark:bg-gray-800/60 shadow-sm">
        <div class="absolute inset-[-200%] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#ff9146_30%,#ffffff_50%,#46d4c6_70%,transparent_100%)] opacity-0 group-hover:opacity-100 animate-[spin_1.5s_linear_infinite] z-0"></div>
        <div class="absolute inset-[2px] rounded-full bg-white/90 dark:bg-gray-800/90 group-hover:bg-[#ff9146]"></div>
        <iconify-icon icon="solar:arrow-right-linear" width="14" class="relative z-10 text-gray-900 dark:text-white group-hover:text-white"></iconify-icon>
      </button>
    </div>
  </div>
</div>
```

### 14. `PD Settings Config Panel` (Control Node)
* **Description**: Config interface element utilizing `.pd-switch` styled checkbox toggles and input fields.
* **Code Snippet**:
```html
<div class="bg-white/40 dark:bg-pd-glass backdrop-blur-2xl border border-gray-200 dark:border-pd-glassBorder rounded-2xl p-5 shadow-md">
  <div class="space-y-3">
    <div>
      <label class="block text-[9px] font-medium text-gray-400 mb-1">Company</label>
      <input type="text" class="w-full bg-white/60 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-full px-3 py-1.5 text-[11px]" value="Acme Corp" />
    </div>
    <div class="flex items-center justify-between p-2 bg-white/60 dark:bg-black/40 rounded-xl">
      <span class="text-[10px]">Outreach</span>
      <label class="pd-switch">
        <input type="checkbox" checked />
        <div class="pd-switch-slider"></div>
      </label>
    </div>
  </div>
</div>
```

### 15. `PD Neural Chat Interface` (Conversation Panel)
* **Description**: Double-glow AI avatar dialog bubble, user bubble and typing indicators (`.typing-dot` animation).
* **Code Snippet**:
```html
<!-- User Message Bubble -->
<div class="self-end max-w-[85%] bg-pd-teal/20 border border-pd-teal/40 rounded-2xl rounded-tr-sm p-3 text-xs">
  <span class="font-bold text-pd-teal text-[9px] uppercase tracking-wider">You</span>
  <p>Launch the design system.</p>
</div>

<!-- AI CEO Message Bubble -->
<div class="self-start max-w-[85%] bg-white/80 dark:bg-pd-glass border border-gray-200 dark:border-pd-glassBorder rounded-2xl rounded-tl-sm p-3 pl-8 text-xs relative">
  <div class="absolute -left-2 -top-2 w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-white dark:bg-gray-800 shadow-sm">
    <div class="absolute inset-[-200%] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#ff9146_30%,#ffffff_50%,#46d4c6_70%,transparent_100%)] opacity-50 animate-[spin_2.5s_linear_infinite]"></div>
    <div class="absolute inset-[1.5px] rounded-full bg-white dark:bg-gray-800"></div>
    <iconify-icon icon="solar:crown-minimalistic-bold" width="10" class="text-pd-orange relative z-10"></iconify-icon>
  </div>
  <span class="font-bold text-pd-orange text-[9px] uppercase tracking-wider">CEO Agent</span>
  <p>How should we proceed?</p>
</div>

<!-- Typing Dot indicator -->
<div class="flex gap-1 items-center px-3 py-2 bg-white/60 dark:bg-pd-glass border border-gray-200 dark:border-pd-glassBorder rounded-2xl w-max">
  <span class="w-1 h-1 rounded-full bg-pd-orange typing-dot"></span>
  <span class="w-1 h-1 rounded-full bg-pd-orange typing-dot" style="animation-delay: 0.15s"></span>
  <span class="w-1 h-1 rounded-full bg-pd-orange typing-dot" style="animation-delay: 0.3s"></span>
</div>
```

---

## 🛠️ Helper Utilities

* **Liquid Click Ripples**: Automatically active upon page load once `presets.js` is loaded. It triggers a glass overlay ripple centered on any mouse click coordinates.
* **Scroll Reveal Animations**: Initialize by calling `PDPresets.initScrollReveal('.reveal-target')` in your script.
* **Theme Switching**: Call `PDPresets.toggleTheme()` to toggle between light and dark modes. It handles document class manipulation and local storage saving.
