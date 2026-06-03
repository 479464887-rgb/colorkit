// ColorKit - Popup
let currentColor = '#58A6FF';

document.addEventListener('DOMContentLoaded', async () => {
  const picker = document.getElementById('color-picker');

  // Color picker change
  picker.addEventListener('input', () => {
    currentColor = picker.value;
    updateColorDisplay();
    generateHarmony();
  });

  // Copy buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const type = btn.dataset.copy;
      let text = '';
      if (type === 'hex') text = currentColor.toUpperCase();
      if (type === 'rgb') text = hexToRgb(currentColor);
      if (type === 'hsl') text = hexToHsl(currentColor);
      await navigator.clipboard.writeText(text);
      btn.textContent = '已复制✓';
      setTimeout(() => btn.textContent = `复制${type.toUpperCase()}`, 1000);
    });
  });

  // Save to history
  document.getElementById('btn-save').addEventListener('click', async () => {
    await chrome.runtime.sendMessage({ type: 'ADD_HISTORY', color: currentColor });
    document.getElementById('btn-save').textContent = '✓ 已保存';
    setTimeout(() => document.getElementById('btn-save').textContent = '📌 保存到历史', 1000);
  });

  // Tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-harmony').style.display = tab.dataset.tab === 'harmony' ? 'block' : 'none';
      document.getElementById('tab-palettes').style.display = tab.dataset.tab === 'palettes' ? 'block' : 'none';
      document.getElementById('tab-history').style.display = tab.dataset.tab === 'history' ? 'block' : 'none';

      if (tab.dataset.tab === 'palettes') loadPalettes();
      if (tab.dataset.tab === 'history') loadHistory();
    });
  });

  // Settings
  document.getElementById('btn-settings').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  // Save palette
  document.getElementById('btn-save-palette').addEventListener('click', async () => {
    const colors = Array.from(document.querySelectorAll('#harmony-grid .swatch-color')).map(el => el.dataset.color);
    const name = prompt('调色板名称：', '我的配色');
    if (name && colors.length) {
      await chrome.runtime.sendMessage({ type: 'SAVE_PALETTE', palette: { name, colors } });
      loadPalettes();
    }
  });

  updateColorDisplay();
  generateHarmony();
});

// ===== Color Utilities =====
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `RGB(${r}, ${g}, ${b})`;
}

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `HSL(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

function updateColorDisplay() {
  document.getElementById('hex-val').textContent = currentColor.toUpperCase();
  document.getElementById('rgb-val').textContent = hexToRgb(currentColor);
  document.getElementById('color-picker').value = currentColor;
}

function generateHarmony() {
  const rgb = hexToRgbObj(currentColor);
  const hsl = rgbToHsl(rgb);

  // Generate harmonies
  const harmonies = {
    base: currentColor,
    complementary: hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
    analogous1: hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
    analogous2: hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
    triadic1: hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
    triadic2: hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
    light: hslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + 20)),
    dark: hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 20)),
    muted: hslToHex(hsl.h, Math.max(0, hsl.s - 30), hsl.l),
    accent: hslToHex((hsl.h + 180) % 360, Math.min(100, hsl.s + 20), Math.min(100, hsl.l + 10))
  };

  const labels = {
    base: '主色', complementary: '互补', analogous1: '邻近+', analogous2: '邻近-',
    triadic1: '三等分1', triadic2: '三等分2', light: '浅色', dark: '深色',
    muted: '柔和', accent: '强调'
  };

  document.getElementById('harmony-grid').innerHTML = Object.entries(harmonies).map(([key, color]) => `
    <div class="swatch" data-color="${color}" onclick="selectColor('${color}')">
      <div class="swatch-color" style="background:${color}" data-color="${color}"></div>
      <div class="swatch-label">${labels[key] || key}</div>
    </div>
  `).join('');
}

function selectColor(color) {
  currentColor = color.toLowerCase();
  document.getElementById('color-picker').value = currentColor;
  updateColorDisplay();
  generateHarmony();
}

async function loadHistory() {
  const { colorHistory = [] } = await chrome.storage.local.get('colorHistory');
  const row = document.getElementById('history-row');
  if (!colorHistory.length) {
    row.innerHTML = '<div class="empty">暂无历史颜色</div>';
    return;
  }
  row.innerHTML = colorHistory.slice(0, 30).map(c =>
    `<div class="hist-dot" style="background:${c}" title="${c}" onclick="selectColor('${c}')"></div>`
  ).join('');
}

async function loadPalettes() {
  const { palettes = [] } = await chrome.storage.local.get('palettes');
  const list = document.getElementById('palette-list');
  if (!palettes.length) {
    list.innerHTML = '<div class="empty">暂无保存的调色板</div>';
    return;
  }
  list.innerHTML = palettes.map(p => `
    <div class="palette-item">
      <div class="palette-name">
        <span>${escapeHtml(p.name)}</span>
        <button class="copy-btn" data-del="${p.id}">✕</button>
      </div>
      <div class="palette-colors">
        ${p.colors.map(c => `<div class="palette-dot" style="background:${c}" onclick="selectColor('${c}')" title="${c}"></div>`).join('')}
      </div>
    </div>
  `).join('');

  list.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await chrome.runtime.sendMessage({ type: 'DELETE_PALETTE', id: btn.dataset.del });
      loadPalettes();
    });
  });
}

function hexToRgbObj(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16)
  };
}

function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}
