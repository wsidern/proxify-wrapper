'use strict';

const { app, globalShortcut, ipcMain, nativeImage } = require("electron")
const { BrowserWindow, setVibrancy } = require("electron-acrylic-window");
const { EventEmitter } = require("node:stream");
const path = require("node:path")

const {
  initEvent,
  getInitInfo,
  getConfig,
  setPropsPath,
  setConfig,
  setIncludedApps,
  setAutostart
} = require("./api/mainApi");

let win, proxiFyreProcess = null;
let config = getConfig();

// utilities
function addCommandLine(...args) {
  app.commandLine.appendSwitch(...args);
};

const options = {
  theme: '#00b7ff80',
  effect: 'mica',
  useCustomWindowRefreshMethod: false,
  maximumRefreshRate: 2,
}

/*
        Events for check to update initInfo
*/


/*
  receive path from user action and set to config file
*/
ipcMain.on("path-from-user", (_event, path) => {
  console.log("Send selected path: ", path)
  setConfig({
    ...config,
    path: path,
  })
  win.webContents.send("init-path-info", path);
});

initEvent.on("init-process-update", () => {
  if (win) {
    const initInfo = getInitInfo();
    win.webContents.send("init-process-info", initInfo.processList);
    console.log("process list updated: ", initInfo.processList.length)
  }
});


function appQuit() {
  if (proxiFyreProcess) {
    proxiFyreProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
  console.log("quit")
}

app.whenReady().then(() => {
  addCommandLine('high-dpi-support', 'true');
  addCommandLine('force-device-scale-factor', '1');
  addCommandLine('enable-gpu');
  addCommandLine('enable-transparent-visuals');

  win = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    width: 1024,
    height: 768,
    icon: "./images/app-ico2.ico",
    resizable: false,
    minimizable: false,
    maximizable: false,
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
  if (config.path) {
    win.webContents.send("init-path-info", config.path);
  }
})

ipcMain.on("start-process", () => {
  if (!config.path) {
    // send event to set path
    return
  };

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

