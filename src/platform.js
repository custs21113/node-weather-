const fs = require('fs');
const path = require('path');
const os = require('os');


function platform() {
    let dirpath = require('puppeteer')._projectRoot;
    let files = fs.readdirSync(dirpath, 'utf-8');
    let local_chromium = fs.readdirSync(path.join(dirpath, files[0]), 'utf-8');
    let platformPuppeteerLocation = fs.readdirSync(path.join(dirpath, files[0], local_chromium[0]), 'utf-8');

    switch (os.platform()) {
        case 'win32': {
            return path.join(dirpath, files[0], local_chromium[0], platformPuppeteerLocation[0], 'chrome.exe');
        };
        case 'linux': {
            return path.join(dirpath, files[0], local_chromium[0], platformPuppeteerLocation[0], 'chrome');
        };
        default:
            throw Error("尚不支持您当前终端所使用的操作系统。");
    }
};

module.exports = {
    broswerPath: platform()
}