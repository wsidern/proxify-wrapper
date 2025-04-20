
const { readFileSync } = require("node:fs");

class ConfigApi {
  constructor() {
    this.config = {};
    this.initConfigBuffer();
  }

  initConfigBuffer() {
    let data = readFileSync('config.json', "utf-8");
    if (data) {
      this.config = JSON.parse(data);
    }
  }

  setConfig(jsonData) {
    let data = JSON.stringify(jsonData, null, 2);
  
    fs.writeFile("config.json", data, 'utf8', (err) => {
      if (err) {
          console.error('Error writing to file', err)
      } else {
          console.log('Data written to file')
      }
    });
  }
}

module.exports = new ConfigApi();