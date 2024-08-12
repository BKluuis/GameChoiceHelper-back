const fs = require("node:fs");

function dataFormatted(data) {
   return `${new Date().toISOString()}: ${JSON.stringify(data, null, 2)},\n`;
}

function writeLog(path, data = "none", flags){
    fs.writeFileSync(__dirname + "/logs/" + path,
     dataFormatted(data),
     flags,
      err => {
        if (err) {
            console.error(err);
        } else {
            console.log(path + " logged");
        }   
     });
}

const logger = {
    user: (req, res, next) => {
        writeLog("user_log.log", {...req.user}, {flag: "a"});
      next();
    },
    cookies: (req, res, next) => {
       writeLog("cookies_log.log", req.session, {flag: "a"} );
      next();
    },
    randomGame: (response) => {
      writeLog("randomGameResponse_log.log", response.data, {flag: "a"});
    },
    list: (list, fileName) => writeLog(`${fileName}.log`, list, {flag: "w"})
}

module.exports = logger;