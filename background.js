// ExtPay - Payment integration
importScripts('ExtPay.js');
const extpay = ExtPay('colorkit');
extpay.startBackground();

// ColorKit - Background Service Worker
chrome.runtime.onInstalled.addListener(async () => {
  const { palettes } = await chrome.storage.local.get('palettes');
  if (!palettes) await chrome.storage.local.set({ palettes: [], colorHistory: [] });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'SAVE_PALETTE':
      savePalette(request.palette).then(sendResponse);
      return true;
  case 'GET_PAID_STATUS':
    extpay.getUser().then(sendResponse);
    return true;
  case 'OPEN_PAYMENT':
    extpay.openPaymentPage();
    sendResponse({ success: true });
    return false;
  case 'OPEN_LOGIN':
    extpay.openLoginPage();
    sendResponse({ success: true });
    return false;

    case 'GET_PALETTES':
      chrome.storage.local.get('palettes').then(sendResponse);
      return true;
  case 'GET_PAID_STATUS':
    extpay.getUser().then(sendResponse);
    return true;
  case 'OPEN_PAYMENT':
    extpay.openPaymentPage();
    sendResponse({ success: true });
    return false;
  case 'OPEN_LOGIN':
    extpay.openLoginPage();
    sendResponse({ success: true });
    return false;

    case 'DELETE_PALETTE':
      deletePalette(request.id).then(sendResponse);
      return true;
  case 'GET_PAID_STATUS':
    extpay.getUser().then(sendResponse);
    return true;
  case 'OPEN_PAYMENT':
    extpay.openPaymentPage();
    sendResponse({ success: true });
    return false;
  case 'OPEN_LOGIN':
    extpay.openLoginPage();
    sendResponse({ success: true });
    return false;

    case 'ADD_HISTORY':
      addHistory(request.color).then(sendResponse);
      return true;
  case 'GET_PAID_STATUS':
    extpay.getUser().then(sendResponse);
    return true;
  case 'OPEN_PAYMENT':
    extpay.openPaymentPage();
    sendResponse({ success: true });
    return false;
  case 'OPEN_LOGIN':
    extpay.openLoginPage();
    sendResponse({ success: true });
    return false;

    case 'GET_HISTORY':
      chrome.storage.local.get('colorHistory').then(sendResponse);
      return true;
  case 'GET_PAID_STATUS':
    extpay.getUser().then(sendResponse);
    return true;
  case 'OPEN_PAYMENT':
    extpay.openPaymentPage();
    sendResponse({ success: true });
    return false;
  case 'OPEN_LOGIN':
    extpay.openLoginPage();
    sendResponse({ success: true });
    return false;

    case 'CLEAR_HISTORY':
      chrome.storage.local.set({ colorHistory: [] }).then(() => sendResponse({ success: true }));
      return true;
  }
});

async function savePalette(palette) {
  const { palettes = [] } = await chrome.storage.local.get('palettes');
  const entry = {
    id: 'pal_' + Date.now().toString(36),
    name: palette.name || `调色板 ${palettes.length + 1}`,
    colors: palette.colors || [],
    createdAt: Date.now()
  };
  await chrome.storage.local.set({ palettes: [entry, ...palettes].slice(0, 50) });
  return { success: true, palette: entry };
}

async function deletePalette(id) {
  const { palettes = [] } = await chrome.storage.local.get('palettes');
  await chrome.storage.local.set({ palettes: palettes.filter(p => p.id !== id) });
  return { success: true };
}

async function addHistory(color) {
  const { colorHistory = [] } = await chrome.storage.local.get('colorHistory');
  const updated = [color, ...colorHistory.filter(c => c !== color)].slice(0, 30);
  await chrome.storage.local.set({ colorHistory: updated });
  return { success: true };
}
