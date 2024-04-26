const fs = require("node:fs");

function dataFormatted(data) {
   return `${new Date().toISOString()}: ${JSON.stringify(data, null, 2)},\n`;
}

function writeLog(path, data, flags){
    fs.writeFile(__dirname + "/logs/" + path,
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
       writeLog("cookies_log.log", req.session ?? "none",{flag: "a"} );
      next();
    },
}

module.exports = logger;