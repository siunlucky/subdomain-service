const path = require('path');
const fs = require('fs');

exports.errorLogs = (msg, req = null, res = null) => {
    const datetime = new Date().toISOString();
    const url = req ? req.originalUrl : "_";
    const method = req ? req.method : "_";
    const status = res ? res.statusCode : "_";

    const logMessage = `${datetime} - ${method} - ${url} - ${status} - ${msg}\n`;

    fs.appendFile(path.join(__dirname, '../error-logs.txt'), logMessage, (err) => {
        if (err) {
            console.error('Failed to write to log file:', err);
        }
    });
};
