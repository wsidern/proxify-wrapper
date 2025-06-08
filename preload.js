'use strict';
const { ipcRenderer, webUtils, app } = require("electron");

function onCloseApp(e) {
  e.preventDefault()
  ipcRenderer.send('close-app');
}
function setPathToElement(path) {
  const haveProxiFyre = path.includes("ProxiFyre.exe");
  if (haveProxiFyre) {
    pathHandler();
  } else {
    pathHandler("err")
  }
  document.getElementById("path").textContent = path;
}
function pathHandler(type) {
  if (type === "err") {
    document.getElementById("path").classList.add("block-error")
  } else {
    document.getElementById("path").classList.remove("block-error")
  }
};
function getFilePath() {
  return webUtils.getPathForFile(document.getElementById("file").files[0]);
};

function setPath(path) {
  setPathToElement(path);
  ipcRenderer.send('path-from-user', path);
}

function fileOnChange() {
  const path = getFilePath();
  setPath(path);
}


function bindInteract() {
  document.getElementById("exit").addEventListener("click", onCloseApp);
  document.getElementById("file").addEventListener("change", fileOnChange);
  document.getElementById("search").addEventListener("input", (event) => onInputSearch(event.target.value));
  document.getElementById("setApps").addEventListener("click", onPickedApps);

  console.log("binded");
};

function setDragListener(elem) {
  document.getElementById(elem).ondrag(() => {});
}

let appsTemp = [];
let appsSelectedTemp = new Set();
let pickedApps = new Set();

function selectProcess(appContainer, checkbox) {
  checkbox.checked = !checkbox.checked;
  if (checkbox.checked){
    appsSelectedTemp.add(appContainer.textContent)
    appContainer.classList.add("app-elem-selected")
  } else {
    appsSelectedTemp.delete(appContainer.textContent)
    appContainer.classList.remove("app-elem-selected")
  }
  console.log(appsSelectedTemp);
}

function createAppElement(app, onClick) {
    let {name, id} = app;  

    const appContainer = document.createElement("div");

    const elem = document.createElement("div");
    elem.classList.add("app-elem");
    elem.textContent = name;
    elem.addEventListener("click", (event) => onClick(event.target, checkbox));
    elem.addEventListener("drag", (event) => {
      console.log("drag")
    });

    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.style.display = "none";
    checkbox.id = name + "_" + id;

    
    if (appsSelectedTemp.has(name)) {
      elem.classList.add("app-elem-selected")
      checkbox.checked = true;
    }
  
    appContainer.append(elem);
    appContainer.append(checkbox);

  return appContainer;
}

function setProcesses(list) {
  // console.log(list)
  const mainContainer = document.getElementById("apps");
  for (let i = 0; i < list.length; i++) {
    const name = list[i];
    const appContainer = createAppElement({name: name, id: i}, selectProcess);

    if (appsSelectedTemp.has(name)) {
      mainContainer.prepend(appContainer);
    } else {
      mainContainer.append(appContainer);
    }

  }
};

function clearProcesses(id) {
  document.getElementById(id).textContent = "";
}

function onInputSearch(value) {
  let searchTemp = new Set();

  appsTemp.forEach((item) => {
    const match = item.toLowerCase().includes(value.toLowerCase())
    if (pickedApps.has(item)) return;
    if (match) {
      searchTemp.add(item);
    } else {
      searchTemp.delete(item);
    }
  });

  clearProcesses("apps");
  setProcesses(Array.from(searchTemp));
};

function createSelectedApps(list) {
  const pickedAppsContainer = document.getElementById("pickedApps");

  clearProcesses("pickedApps");
  for (let i = 0; i < list.length; i++) {
    const name = list[i];
    const appContainer = createAppElement({name: name, id: i}, selectProcess);
    pickedAppsContainer.append(appContainer);
  }
}

function onPickedApps() {
  if (appsSelectedTemp.length === 0) return;

  let result = appsTemp.filter((item) => {
    if (appsSelectedTemp.has(item) && pickedApps.has(item)) {
      pickedApps.delete(item)
    } else if (appsSelectedTemp.has(item)) {
      pickedApps.add(item)
    }

    if (pickedApps.has(item)) return false
    return true
  })

  appsSelectedTemp.clear();
  clearProcesses("apps");

  const inputValue = document.getElementById("search").value;
  if (inputValue.length > 0) {
    onInputSearch(inputValue);
  } else {
    setProcesses(result);
  }

  createSelectedApps(Array.from(pickedApps));
  ipcRenderer.send('send-apps-to-config', Array.from(pickedApps));
}

/*
  event listeners from main.js
*/
ipcRenderer.on('init-path-info', (_event, path) => {
  console.log(path)
  setPathToElement(path);
});
ipcRenderer.on('init-process-info', (_event, list) => {
  console.log("list")
  setProcesses(list)
  appsTemp = list;
});

// ipcRenderer.on('init-path', (event, path) => {
//   console.log("RECEIVE PATH: ", path)
// //   setPath(path);
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