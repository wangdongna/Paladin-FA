import * as OSS from "ali-oss";
import * as fs from "fs";
import { configure, getLogger } from "log4js";
import * as moment from "moment";
import * as path from "path";
import * as puppeteer from "puppeteer";
import logConfig from "./logConfig";
import notification from "./notification";
import * as config from './prodConfig';
import { pushDuration, pushStatus, reset } from "./pushGateway";
import { getValidationCode, isMaintaining } from "./util";
import * as express from "express"
import * as promClient from "prom-client"
import * as bodyParser from "body-parser"

const LOG_LEVEL = process.env["LOG_LEVEL"] || "DEBUG"

configure(logConfig(LOG_LEVEL))

const logger = getLogger("index")
const endpoint = process.env["HARDCORE_OSS_ENDPOINT"]
const accessKeySecret = process.env["COMMON_ALIYUN_ACCESS_SECRET"]
const accessKeyId = process.env["COMMON_ALIYUN_ACCESS_ID"]
const bucket = process.env["OSS_BUCKET_DATA"]
const NODE_ENV = process.env["NODE_ENV"]

const PROD_CODE_NAME = process.env["PROD_CODE_NAME"]

const NAV_TIMEOUT = parseInt(process.env["NAV_TIMEOUT"] || "15") * 1000;
const CLICK_TIMEOUT = parseInt(process.env["CLICK_TIMEOUT"] || "5") * 1000;


let envArgs: Array<string> = ["TROJAN_HOST", "LOG_LEVEL", "NODE_ENV", "HARDCORE_OSS_ENDPOINT", "OSS_BUCKET_DATA", "COMMON_ALIYUN_ACCESS_SECRET", "COMMON_ALIYUN_ACCESS_ID"]

envArgs.forEach((item: string) => {
  let ret = false;
  let val = process.env[item]
  if (!val) {
    logger.fatal("env var %s missing", item)
    ret = true
  }
  else {
    logger.debug("%s is %s", item, val)
  }
  if (ret) {
    process.exit(1);
  }
})

logger.debug("proxy: %s, %s", process.env["HTTP_PROXY"], process.env["HTTPS_PROXY"])

const ossClient = new OSS({
  endpoint,
  accessKeyId,
  accessKeySecret,
  bucket,
  internal: NODE_ENV === "production" ? true : false
});

const app = express()
const port = 3000
const register = promClient.register


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType)
  res.status(200).send(register.metrics())
  if (isEnd) {
    reset()
  }

})

const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 60 * 1000, prefix: 'paladin_' });

app.get("/healthz", (req, res) => {
  logger.info("healthz")
  res.status(200).send("ok")
})

app.post("/maintain", (req, res) => {
  let { maintain } = req.body
  logger.info("maintaining status change to : %d", maintain)
  if (maintain === 1) {
    process.env["IS_MAINTAINING"] = "1"
    reset()
  }
  else {
    process.env["IS_MAINTAINING"] = "0"
  }
  res.status(200).send("ok")
})

app.listen(port, () => {
  logger.info(`paladin app listening on port ${port}!`)
  start()
  setInterval(start, 2 * 60 * 1000)
})



async function createPage(browser: puppeteer.Browser) {
  const page = await browser.newPage();
  // page.setCacheEnabled(false)
  page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36 Paladin")
  page.setDefaultNavigationTimeout(NAV_TIMEOUT)
  page.on("requestfailed", (request) => {
    logger.debug("requestfailed: %s", request.url())
  })
  page.on("response", (response) => {
    if (!response.ok() && response.status() >= 400) {
      logger.debug("response maybe error: %s, %s", response.status(), response.url())
    }

  })

  return page;
}

function getImageName(key: string) {
  return `${key}-${moment().utcOffset(8).format("YYYY-MM-DD HH:mm:DD")}.png`
}


const navigationOption: puppeteer.NavigationOptions = { waitUntil: ["domcontentloaded"] }
const timeoutOption = { timeout: CLICK_TIMEOUT }

let checkRoleList = ""
let lastAction = ""

async function run(page: puppeteer.Page, config: config.Config) {
  checkRoleList = `${config.codeName}-ui`;
  let startTime: any = new Date()
  let endTime: any = new Date()
  let duration: number = 0
  let response = await page.goto(config.mainUri)
  // quote from official website
  // page.goto either throw or return a main resource response.
  // The only exceptions are navigation to about:blank or navigation to the
  // same URL with a different hash, which would succeed and return null
  if (response) {
    if (response.status() === 200) {
      logger.info("enter page: %s", response.url())
    }
    else {
      logger.error("fail to enter page: %s", config.mainUri)
      throw new Error(`enter page failed: ${response.url()}`)
    }
  }

  lastAction = "mainpage"
  if (config.codeName !== "polka") {
    let loginButton = await page.waitForSelector(config.loginButtonClass, timeoutOption)
    if (loginButton) {
      logger.info("login button shown")
      let imageName = getImageName("mainpage");
      await page.screenshot({ path: path.join(__dirname, imageName) });
      endTime = new Date()
      duration = (endTime - startTime) / 1000
      pushDuration(config.prodAlias, duration, "mainpage_success")
    }
    else {
      logger.info("login button not shown, url is: %s", page.url())
      throw new Error("unknow error")
    }

    checkRoleList = `guard-ui,guard,classic`;
    startTime = new Date()
    let responses = await Promise.all([
      await page.click(config.loginButtonClass),
      await page.waitForNavigation(navigationOption),
      // await page.waitForNavigation(navigationOption)
    ])
    responses.forEach((item: any) => {
      if (item && item.url) {
        logger.info("url change to %s", item.url());
      }
    })
  }
  else {
    checkRoleList = `guard-ui,guard,classic`;
    await page.waitForNavigation(navigationOption)
  }
  logger.info("entering sso page")
  lastAction = "sso"
  const veriCodeRes = await page.waitForResponse(
    response => response.url().indexOf("GetVerificationCode") >= 0 && response.status() === 200 && response.request().method() !== "OPTIONS");
  logger.info("veri code got it")
  endTime = new Date()
  duration = (endTime - startTime) / 1000
  pushDuration(config.prodAlias, duration, "sso_success")

  let imageName = getImageName("sso");
  await page.screenshot({ path: path.join(__dirname, imageName) });
  logger.info("screenshot finished, name is %s", imageName)

  const { Result: { Id } } = await veriCodeRes.json();
  logger.debug(`vericode id is ${Id}`)

  await new Promise((resolve, reject) => {
    getValidationCode(Id, async (val) => {
      try {
        const result = val
        logger.debug("veri code value is", result)

        if (!result) throw new Error("validtion code is empty")

        await page.type("input[placeholder=请输入用户名]", config.username)
        await page.type("input[placeholder=请输入密码]", config.password)
        await page.type("input[placeholder=请输入图中算式结果]", result)

        lastAction = "sso-filled-in"
        let imageName = getImageName("sso-filled-in");
        await page.screenshot({ path: path.join(__dirname, imageName) });
        logger.info("screenshot finished, name is %s", imageName)


        let buttons = await page.$$(".pop-login-form-content-button button")
        checkRoleList = `${config.codeName}-webapi,${config.codeName}-app`;
        lastAction = "login-success"
        startTime = new Date()
        let responses = await Promise.all([
          await buttons[1].click(),
          await page.waitForNavigation(navigationOption),
          await page.waitForNavigation(navigationOption),
          await page.waitForNavigation(navigationOption),
        ])
        logger.info("customer selection shown")
        responses.forEach((item: any) => {
          if (item && item.url) {
            logger.info("uri change to %s", item.url())
          }
        })


        await page.waitForSelector(config.spMgmtClass, timeoutOption)
        // await page.waitFor(10 * 1000); //wait for 10 seconds
        logger.info("login success")
        endTime = new Date()
        duration = (endTime - startTime) / 1000
        pushDuration(config.prodAlias, duration, "login_success")

        imageName = getImageName("login-success");
        await page.screenshot({ path: path.join(__dirname, imageName) });
        logger.info("screenshot finished, name is %s", imageName)


        resolve()
      }
      catch (error) {
        logger.error(error)
        reject(error)
      }
    })
  })


}

async function upload(config: config.Config) {
  logger.info("ready upload images")
  let files = fs.readdirSync(__dirname);
  let date = moment().utcOffset(8)
  let folder = `paladin/${config.prodName}/${date.format("YYYY")}/${date.format("MM")}/${date.format("DD")}/${date.format("HH")}`;
  for (let i = 0; i < files.length; ++i) {
    let item = files[i];
    let fileName = `${folder}/${item}`;
    if (item.endsWith(".png")) {
      logger.debug("ready put item: ", fileName)
      let ret = await ossClient.put(fileName, path.join(__dirname, item))
      logger.info("file %s is uploaded", ret.name)
    }
  }
}

function cleanImage() {
  logger.info("ready clean Images")
  let files = fs.readdirSync(__dirname);
  files.forEach((item: string) => {
    let fileName = item;
    if (item.endsWith(".png")) {
      logger.debug("ready delete item: ", fileName)
      let filePath = path.join(__dirname, fileName)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info("file %s is deleted", fileName)
      }

    }
  })
}

// uploadAndCleanImage()
// cleanImage()
async function getBrowser() {
  let args = ['--lang=zh-cn', '--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox']
  logger.debug("SE_PROXY: %s", process.env["SE_PROXY"])
  if (process.env["SE_PROXY"] === "1") {
    args.push('--proxy-server=101.231.121.17:80')
  }
  const browser = await puppeteer.launch({
    defaultViewport: {
      width: 1920,
      height: 1080
    },
    ignoreHTTPSErrors: true,
    args
  })

  return browser
}
let isEnd = false
async function start() {
  if (isMaintaining()) {
    logger.info("it is maintaining, not start to collect")
    return
  }
  logger.info("started")
  isEnd = false
  try {
    let config1 = config.configList.find((value) => value.codeName === PROD_CODE_NAME)
    await notification.syncLastStatus(ossClient, config1)
    const browser = await getBrowser()
    checkRoleList = ""
    const page = await createPage(browser)
    logger.info("page created for: %s", config1.prodName)
    let startTime: any = new Date()
    try {
      await run(page, config1);
      await page.close()
      let endTime: any = new Date()
      let duration: any = (endTime - startTime) / 1000
      pushDuration(config1.prodAlias, duration, "full")
      //pushStatus must be last one be called
      pushStatus(config1.prodAlias, 0)
      notification.success(config1.prodName)
    }
    catch (error) {
      logger.error(error)
      logger.error(page.url())
      //pushstatus must be last one be called
      pushStatus(config1.prodAlias, 1)
      let errorFileName = getImageName(`error-before-${lastAction}`)
      await page.screenshot({ path: path.join(__dirname, errorFileName) });
      await page.close()
      notification.error(config1.prodName, error, checkRoleList)
    }
    finally {
      await upload(config1)
      cleanImage()
      await browser.close()
      logger.info("browser closed")
    }

    await notification.pushLastStatus(ossClient, config1)
    isEnd = true

  } catch (error) {
    logger.fatal("Unknown error: %s", error)
  }
}
