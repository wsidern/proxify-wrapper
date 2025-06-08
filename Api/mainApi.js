const { exec } = require('node:child_process');
const fs = require('fs');
const { readFileSync } = require("node:fs");
const { EventEmitter } = require("node:stream");

/*
  App props
*/
let initInfo = {
  includedApps: [],
  processList: [],
};

/*
  Main config file
*/

const initEvent = new EventEmitter();
const api = {
  setAppProcessList: (list) => {
    initInfo.processList = list;
    initEvent.emit("init-process-update");
  },
  setIncludedApps: (apps) => {
    // initInfo.includedApps = apps;
    // initEvent.emit("init-included-apps-update");
  },
  setAutostart: (autostart) => {
    initEvent.emit("init-autostart-update", autostart);
  },

  /*
    utils
  */
  getProcessListFromSystem: async () => {
    return new Promise((resolve, reject) => {
      exec('powershell "Get-Process | Select-Object Name, Id"', (error, stdout, stderr) => {
        if (error) {
            return reject(`Ошибка: ${error.message}`);
        }
        if (stderr) {
            return reject(`Сбой: ${stderr}`);
        }

        const list = stdout
          .trim()
          .split('\n')
          .sort()
          .map((line) => {
            const parts = line.trim().split(/\s{2,}/);
            return parts[0];
          })

        const result = Array.from(new Set(list))
          .filter((item) => {
            if (!initInfo.includedApps.includes(item)) {
              return item;
            }
          })

        resolve(result);

      });
    })
  },
  getConfig: () => {
    const data = readFileSync('config.json', "utf-8");
    return JSON.parse(data);
  },
  setConfig: (jsonData) => {
    let data = JSON.stringify(jsonData, null, 2);

    fs.writeFile("config.json", data, 'utf8', (err) => {
      if (err) {
          console.error('Error writing to file', err)
      } else {
          console.log('Data written to file')
      }
    });
  },
};

/* 
  Initializing settings after startup.
*/
initSettings();

async function initSettings() {
  console.log("Initializing settings after startup.");

  let list = await api.getProcessListFromSystem()
    .then((data) => {
      return data;
    })
    .catch((err) => {
      console.log(err);
      return [];
    });
  
  api.setAppProcessList(list);
  
}

module.exports = {
  ...api,
  initEvent,
  getInitInfo: () => initInfo,
};