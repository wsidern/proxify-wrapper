'use strict';
const { ipcRenderer, webUtils } = require("electron");

let state;

let apps;
let searchTemp = new Set();

function closeApp(e) {
  e.preventDefault()
  ipcRenderer.send('close-app');
}
function setPath(path) {
  document.getElementById("path").textContent = path;
}
function pathErrorHandler() {
  document.getElementById("path").classList.add("block-error")
};
function pathAcceptHandler() {
  document.getElementById("path").classList.remove("block-error")
};
function getFilePath() {
  const path = webUtils.getPathForFile(document.getElementById("file").files[0]);
  const haveProxiFyre = path.includes("ProxiFyre.exe");
  if (haveProxiFyre) {
    pathAcceptHandler();
    setPath(path)
    ipcRenderer.send('set-path', path);
  } else {
    pathErrorHandler();
    setPath(path)
  }
};

function bindInteract() {
  document.getElementById("exit").addEventListener("click", closeApp);
  document.getElementById("file").addEventListener("change", getFilePath);
  document.getElementById("search").addEventListener("input", searchApp);

  console.log("binded");
};


// process list control
// function selectProcesses() {
//   const container = document.getElementById("apps");
//   const childs = Array.from(container.children);

//   childs.map((item) => {
//     if (selected.has(item.firstChild.id)) {
//       item.classList.add("app-elem-selected");
//     } else {
//       item.classList.remove("app-elem-selected");
//     }
//   })
// }
// function addProcess(checkbox) {
//   const isChecked = checkbox.checked;
//   const id = checkbox.id;
//   if (isChecked) {
//     selected.add(id);
//   } else if (selected.has(id)) {
//     selected.delete(id);
//   };
//   // selectProcesses()
// }
// function changeCheckbox(container, checkbox) {
//   checkbox.checked = !checkbox.checked;
//   console.log()
//   const selected = container.classList.contains("app-elem-selected");

//   if (checkbox && selected) {
//     console.log("eeee")
//     container.classList.remove("app-elem-selected");
//     addProcess(checkbox);
//   } else if (checkbox) {
//     addProcess(checkbox);
//   }
// }

// function setCurrentApps(appsList) {
//   for (let index = 0; index < appsList.length; index++) {
//     let container = document.createElement("div");
//     container.classList.add("app-elem");

//     let item = document.createElement("div");
//     item.textContent = appsList[index];

//     let checkbox = document.createElement("input");
//     checkbox.type = "checkbox";
//     checkbox.id = appsList[index];
//     checkbox.classList.add("checkbox-process");
    
//     container.append(checkbox);
//     container.append(item);
//     container.addEventListener("click", (event) => changeCheckbox(container, checkbox))

//     document.getElementById("apps").append(container);
//   }
// }


function searchApp(event) {
  let value = event.target.value;

  apps.filter((item) => {
    const match = item.toLowerCase().includes(value.toLowerCase())
    if (match) {
      searchTemp.add(item);
    } else {
      searchTemp.delete(item);
    }
  });

  console.log(searchTemp)

  // document.getElementById("apps").textContent = '';
  // setCurrentApps(Array.from(searchTemp));
  // selectProcesses()
};

ipcRenderer.on('init-info', (event, initInfo) => {
});
ipcRenderer.on('set-process-list', (event, appsList) => {
  apps = appsList
});

// ipcRenderer.on('init-path', (event, path) => {
//   console.log("RECEIVE PATH: ", path)
//   setPath(path);
// });

// ipcRenderer.on("path-error", () => {
//   console.log("error")
//   pathErrorHandler();
// });

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type]);
  };

  bindInteract();
});

ipcRenderer.send('start-process');
ipcRenderer.on('log', (event, log) => {
  const logsElement = document.getElementById('logs');
  const logElement = document.createElement('p');
  if (log) {
    logElement.textContent = log + '\n'
    logsElement.append(logElement)
  };
});