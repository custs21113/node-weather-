"use strict"
require('events').EventEmitter.defaultMaxListeners = 0;
const puppeteer = require('puppeteer');
const fs = require('fs/promises');
const path = require('path');
const axios = require('axios');

const { broswerPath } = require('./platform'); // 获取不同平台不同版本下的chrome浏览器路径

// 获取省份url
async function getProvinceUrls() {
    const broswer = await puppeteer.launch({
        executablePath: broswerPath,
        args: ['--no-sandbox'],
        timeout: 0
    });
    let result = [];
    try {
        const page = (await broswer.pages())[0];
        await page.goto(`https://weather.cma.cn/web/text/HD/AZJ.html`, {
            waitUntil: 'load',
            timeout: 0
        });
        let cities = await page.$$eval(`body > div.container > div.provincetable > table > tbody > tr > td > dl > dd > a`, tr => tr.map(x => {
            return {
                cityName: x.innerText,
                cityUrl: x.href
            }
        }))
        console.log("writing .......", cities);
        fs.writeFile(path.resolve(__dirname, './static/cities.json'), JSON.stringify({ cities }, null, 2));
    } catch (error) {
        console.log(error)
    } finally {
        await broswer.close();
        console.timeEnd('start');
        return result;
    }
}

// 根据省份url 获取城市id
async function getCityIDByCityUrl(city) {
    let { cityName, cityUrl } = city;
    const broswer = await puppeteer.launch({
        executablePath: broswerPath,
        args: ['--no-sandbox'],
        timeout: 0
    });

    let cities = [];
    try {
        const page = (await broswer.pages())[0];
        await page.goto(cityUrl, {
            waitUntil: 'load',
            timeout: 0
        });
        let cityNameArray = await page.$$eval(`#day0 > table > tbody > tr > td > a`, tr => tr.map(x => x.innerText));
        let cityIdArray = await page.$$eval(`#day0 > table > tbody > tr > td > a`, a => a.map(x => x.href));

        cityNameArray = cityNameArray.filter((_, index) => index % 2 === 0);
        cityIdArray = cityIdArray.filter((_, index) => index % 2 === 0);

        for (let i = 0; i < cityNameArray.length; i++) {
            cities[i] = {
                id: parseInt(cityIdArray[i].match(/(\d)*$/g)[0]),
                cityName: cityNameArray[i]
            };
        }
    } catch (error) {
        console.log(error)
    } finally {
        await broswer.close();
        console.timeEnd('start');
        return { province: cityName, cities };
    }
};

// 遍历每个省份的城市记录城市信息 
async function stepCities() {
    const { cities } = require('./static/cities.json');
    let num = 0;
    for await (let city of cities) {
        let { province, cities } = await getCityIDByCityUrl(city);
        await fs.writeFile(path.resolve(__dirname, `./static/${province}.json`), JSON.stringify({ cities }, null, 2));
        num++;
    };
    console.timeEnd('start');
    return num;
};

async function stepCitiesChuanXing() { // 串行。
    let promiseArray = [];
    const { cities } = require('./static/cities.json');
    for (let city of cities) {
        promiseArray.push(new Promise(async (resolve, reject) => {
            resolve(getCityIDByCityUrl.bind(null, city));
        }));
    }
    for await (let pro of promiseArray) {

        let { province, cities } = await pro();
        await fs.writeFile(path.resolve(__dirname, `./static/${province}.json`), JSON.stringify({ cities: cities }, null, 2));
        console.log(new Date().toLocaleTimeString());
    }
    console.timeEnd('start');
};

// 从本地数据中返回省份信息
async function getProvinces() {
    let provinces = await fs.readdir(path.resolve(__dirname, 'static'));
    provinces = await provinces.filter(item => /^\W+.json$/u.test(item)).map(item => /^(?<province>\W+).json$/.exec(item).groups.province);
    return provinces
}

// 从本地数据中返回省份信息
async function getCitiesByProvincesIndex(province) {
    const { cities } = require(`./static/${province}.json`);
    return cities;

}
// 根据城市id在中国天气网查询天气信息
async function getWeatherInfoByCityID(id) {
    let { data } = await axios.get(`https://weather.cma.cn/api/now/${id}`);
    return data;
};

console.time('start');
module.exports = {
    getProvinceUrls,
    getProvinces,
    getCitiesByProvincesIndex,
    getWeatherInfoByCityID,
    stepCities,
    stepCitiesChuanXing,
}