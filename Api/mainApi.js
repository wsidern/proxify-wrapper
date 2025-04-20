
class MainApi {
  constructor() {
    this.initInfo = {
      proxiFyrePath: "",
      includedApps: [],
      processList: [],
      autostart: false,
    };
    this.setProcessList();
  };
  setPath(path) {
    this.initInfo.proxiFyrePath = path;
  }
  setAutostart(autostart) {
    this.initInfo.autostart = autostart;
  }
  setProcessList() {
    exec('powershell "Get-Process | Select-Object Name, Id"', (error, stdout, stderr) => {
      if (error) {
          console.error(`Ошибка: ${error.message}`);
          return;
      }
      if (stderr) {
          console.error(`Сбой: ${stderr}`);
          return;
      }
  
      this.initInfo.processList = stdout
        .trim()
        .split('\n')
        .slice(2)
        .sort()
        .map((line) => {
          const parts = line.trim().split(/\s{2,}/);
          return parts[0];
        })
  
        console.log(`Запущенные процессы: ${processList.length}`);
    });
  }
  setIncludedApps(apps) {
    this.initInfo.includedApps = apps;
  }

};

module.exports = new MainApi();