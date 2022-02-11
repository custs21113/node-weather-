const Koa = require('koa2');
const cors = require('koa2-cors');
const Router = require('koa-router')
const koaBody = require("koa-body");

const { getProvinces, getCitiesByProvincesIndex, getWeatherInfoByCityID, getProvinceUrls, stepCities } = require('./index');

const app = new Koa();
const router = new Router();
const PORT = 3004;

app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Credentials', true);
    await next()
});

router.get('/getProvinces', async (ctx) => {
    const provinces = await getProvinces();
    ctx.body = {
        msg: 'success',
        data: provinces
    }
});
router.get('/getProvinceUrls', async (ctx) => {
    const result = await getProvinceUrls();
    ctx.body = {
        msg: 'success',
    }
});
router.get('/stepCities', async (ctx) => {
    const num = await stepCities();
    console.log(num);
    ctx.body = {
        msg: 'success',
        num
    }
});
router.get('/provinces/:provIndex', async (ctx) => {
    const { provIndex } = ctx.params;
    const cities = await getCitiesByProvincesIndex(provIndex);
    ctx.body = {
        msg: 'success',
        data: cities
    }
});

router.get('/city/:cityID', async (ctx) => {
    const { cityID } = ctx.params
    const data = await getWeatherInfoByCityID(cityID);
    ctx.body = {
        ...data
    }
});

app.use(cors({
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
})).use(koaBody({
    strict: false
})).use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
    console.log(`app starting at port ${PORT}`);
})