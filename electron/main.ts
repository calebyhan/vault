import { app, BrowserWindow } from 'electron';
import path from 'path';
import { initializeDatabase } from './database';
import { registerIpcHandlers } from './ipc-handlers';
import dotenv from 'dotenv';

// Check if in development mode
const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;

// Load environment variables
if (isDev) {
  // In development, load from .env.local or .env
  // __dirname is dist/electron/electron, so we need to go up 3 levels to reach project root
  dotenv.config({ path: path.join(__dirname, '../../../.env.local') });
  dotenv.config({ path: path.join(__dirname, '../../../.env') });
  console.log('Environment loaded. API key present:', !!process.env.GEMINI_API_KEY);
}

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    titleBarStyle: 'default',
    title: 'Vault',
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    await initializeDatabase();
    registerIpcHandlers();
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Failed to initialize app:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
