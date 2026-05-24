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

---

## 🛠️ Helper Utilities

* **Liquid Click Ripples**: Automatically active upon page load once `presets.js` is loaded. It triggers a glass overlay ripple centered on any mouse click coordinates.
* **Scroll Reveal Animations**: Initialize by calling `PDPresets.initScrollReveal('.reveal-target')` in your script.
* **Theme Switching**: Call `PDPresets.toggleTheme()` to toggle between light and dark modes. It handles document class manipulation and local storage saving.
