'use strict';

const { app, globalShortcut, ipcMain, nativeImage } = require("electron")
const { BrowserWindow, setVibrancy } = require("electron-acrylic-window");

const path = require("node:path")
const fs = require('fs');
const { readFileSync } = require("node:fs");
const { spawn, exec } = require('node:child_process');

const { config, setConfig } = require("./Api/configApi");
const { initInfo, setPath, setIncludedApps  } = require("./Api/mainApi");

let win = null;
let proxiFyreProcess = null;
// let proxiFyrePath = "C:/Users/R/Desktop/vpn/proxy/Proxifyre.exe";
// let processList = [];

const options = {
  theme: '#00b7ff80',
  effect: 'mica',
  useCustomWindowRefreshMethod: false,
  maximumRefreshRate: 2,
}

function createWindow () {
  win = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    width: 1024,
    height: 768,
    icon: "./images/app-ico2.ico",
    resizable: false,
    frame: false,
    transparent: true,
    vibrancy: {
      disableOnBlur: false,
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  })
  
  win.loadFile('index.html');
  win.setOverlayIcon(nativeImage.createFromPath('bar-icon.png'), 'Description for overlay');
  win.webContents.openDevTools();

  setVibrancy(win, options);
}

function sendInitInfo() {
  win.webContents.send("init-info", initInfo);
}


function appQuit() {
  if (proxiFyreProcess) {
    proxiFyreProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
  console.log("quit")
}

ipcMain.on("set-path", (event, path) => {
  
})

app.whenReady().then(() => {
  app.commandLine.appendSwitch('high-dpi-support', 'true');
  app.commandLine.appendSwitch('force-device-scale-factor', '1');
  app.commandLine.appendSwitch('enable-gpu');
  app.commandLine.appendSwitch('enable-transparent-visuals');

  function onAppReady() {
    createWindow()
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
          createWindow();
      } 
    })
  }
  setTimeout(onAppReady, 1000);
})

ipcMain.on("start-process", () => {
  
  // if(!proxiFyreProcess) {
  //   proxiFyreProcess = spawn(config.path);

  //   proxiFyreProcess.stdout.on('data', (data) => {
  //     const log = data.toString();
  //     console.log(`Log: ${log}`);
  //     win.webContents.send('log', log);
  //   });
  
  //   proxiFyreProcess.stderr.on('data', (data) => {
  //     const error = data.toString();
  //     console.error(`Error: ${error}`);
  //     win.webContents.send('log', `Error: ${error}`);
  //   });
  
  //   proxiFyreProcess.on('close', (code) => {
  //     console.log(`proxiFyre.exe exited with code ${code}`);
  //     win.webContents.send('log', `proxiFyre.exe exited with code ${code}`);
  //     proxiFyreProcess = null; // Сброс переменной
  //   });
  
  //   win.webContents.send('log', 'proxiFyre.exe started.');
  // } else {
  //   win.webContents.send('log', 'Process is already running.');
  // }
})

ipcMain.on("end-process", () => {
  if (proxiFyreProcess) {
    proxiFyreProcess.kill()
  }
})

ipcMain.on("close-app", () => {
  console.log("close-app")
  appQuit()
})
app.on('window-all-closed', () => {
  console.log("quit")
  appQuit()
})

