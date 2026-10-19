'use strict';

const {
  app,
  BrowserWindow,
  Menu,
  shell,
  session,
  systemPreferences,
  desktopCapturer
} = require('electron');
const fs = require('fs');
const path = require('path');

app.setName('LinguaSpire');

function readConfig() {
  const candidates = [
    path.join(process.resourcesPath || '', 'app-config.json'),
    path.join(__dirname, 'app-config.json')
  ];
  for (const file of candidates) {
    try {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (parsed && typeof parsed.appUrl === 'string') return parsed;
    } catch (_) {}
  }
  return {
    appUrl: 'https://frontend-production-802b.up.railway.app/',
    allowedHosts: ['frontend-production-802b.up.railway.app']
  };
}

const config = readConfig();
let mainWindow = null;

function isAllowed(urlString) {
  try {
    const u = new URL(urlString);
    if (u.protocol !== 'https:') return false;
    return (config.allowedHosts || []).includes(u.hostname);
  } catch (_) {
    return false;
  }
}

async function requestMacMediaPermissions() {
  if (process.platform !== 'darwin') return;
  for (const media of ['camera', 'microphone']) {
    try {
      const status = systemPreferences.getMediaAccessStatus(media);
      if (status === 'not-determined') {
        await systemPreferences.askForMediaAccess(media);
      }
    } catch (_) {}
  }
}

function installMenu() {
  const template = [
    {
      label: 'LinguaSpire',
      submenu: [
        { role: 'about', label: 'About LinguaSpire' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit', label: 'Quit LinguaSpire' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { role: 'front' }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function offlinePage(target) {
  const safe = String(target).replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
  return 'data:text/html;charset=utf-8,' + encodeURIComponent(`<!doctype html>
  <html><head><meta charset="utf-8"><title>LinguaSpire</title></head>
  <body style="margin:0;background:#071325;color:#fff;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;display:grid;place-items:center;height:100vh">
    <main style="max-width:620px;padding:42px;text-align:center">
      <div style="width:72px;height:72px;border-radius:20px;background:linear-gradient(135deg,#39bdf8,#6d5cff);display:grid;place-items:center;margin:0 auto 22px;font-size:38px;font-weight:900">L</div>
      <h1 style="font-size:36px;margin:0 0 12px">LinguaSpire</h1>
      <p style="color:#aebdd2;line-height:1.65">The LinguaSpire service could not be reached. Check your internet connection and try again.</p>
      <p style="color:#7588a5;font-size:13px">Server: ${safe}</p>
      <button onclick="location.reload()" style="margin-top:15px;padding:12px 20px;border:0;border-radius:12px;background:#4f7cff;color:#fff;font-size:15px;font-weight:700">Try again</button>
    </main>
  </body></html>`);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 980,
    minHeight: 680,
    title: 'LinguaSpire',
    backgroundColor: '#071325',
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 18, y: 18 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      spellcheck: true,
      autoplayPolicy: 'no-user-gesture-required'
    }
  });

  mainWindow.once('ready-to-show', () => mainWindow?.show());

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowed(url)) return { action: 'allow' };
    shell.openExternal(url).catch(() => undefined);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!isAllowed(url)) {
      event.preventDefault();
      shell.openExternal(url).catch(() => undefined);
    }
  });

  const target = process.env.LINGUASPIRE_APP_URL || config.appUrl;
  mainWindow.loadURL(target).catch(() => {
    mainWindow?.loadURL(offlinePage(target));
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function configurePermissions() {
  const allowedPermissions = new Set([
    'media',
    'display-capture',
    'notifications',
    'fullscreen'
  ]);

  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const origin = webContents.getURL();
    callback(Boolean(isAllowed(origin) && allowedPermissions.has(permission)));
  });

  session.defaultSession.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
    const origin = requestingOrigin || webContents?.getURL() || '';
    return Boolean(isAllowed(origin) && allowedPermissions.has(permission));
  });

  if (session.defaultSession.setDisplayMediaRequestHandler) {
    session.defaultSession.setDisplayMediaRequestHandler(async (_request, callback) => {
      try {
        const sources = await desktopCapturer.getSources({
          types: ['screen', 'window'],
          thumbnailSize: { width: 320, height: 180 },
          fetchWindowIcons: true
        });
        const screen = sources.find(s => s.id.startsWith('screen:')) || sources[0];
        if (!screen) return callback({});
        callback({ video: screen });
      } catch (_) {
        callback({});
      }
    });
  }
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    installMenu();
    configurePermissions();
    await requestMacMediaPermissions();
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
