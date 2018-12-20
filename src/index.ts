import * as puppeteer from "puppeteer"
import * as moment from "moment"
import * as path from "path"
import * as memjs from "memjs"
import { configure, getLogger } from "log4js";
import logConfig from "./logConfig";
import * as fs from "fs";
import * as OSS from "ali-oss"

const LOG_LEVEL = process.env["LOG_LEVEL"] || "DEBUG"

configure(logConfig(LOG_LEVEL))

const logger = getLogger("index")

const mainUri = process.env["PALADIN_MAIN_URI"]
const username = process.env["PALADIN_USERNAME"]
const password = process.env["PALADIN_PASSWORD"]

// logger.debug(process.env["HTTP_PROXY"])

logger.debug("main uri is %s", mainUri)
logger.debug("username is %s", username)
logger.debug("password is %s", password)

const endpoint = process.env["ALI_SDK_OSS_ENDPOINT"]
const accessKeySecret = process.env["ALI_SDK_STS_SECRET"]
const accessKeyId = process.env["ALI_SDK_STS_ID"]
const bucket = process.env["OSS_DATA_BUCKET"]

const NODE_ENV = process.env["NODE_ENV"]

logger.debug("oss endpoint is %s", endpoint)
logger.debug("oss bucket is %s", bucket)
logger.debug("aliyun accessKeyId is %s", accessKeyId)
logger.debug("aliyun accessKeySecret is %s", accessKeySecret)

const ossClient = new OSS({
  endpoint,
  accessKeyId,
  accessKeySecret,
  bucket,
  internal: NODE_ENV === "production" ? true : false
});


async function createPage(browser: puppeteer.Browser) {

  cleanImage();

  const page = await browser.newPage();
  page.setCacheEnabled(false)
  //TODO
  page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36 Paladin")
  logger.info("page created")
  return page;
}

function createMemClient() {
  const memClient = memjs.Client.create()
  logger.info("memcache client created")
  return memClient;
}

function getImageName(key: string) {
  return `${key}-${moment().toISOString()}.png`
}

const timeoutOption = {timeout: 10 * 1000} // timeout is 10 seconds
 
async function run() {
  const memClient = createMemClient()
  const browser = await puppeteer.launch({
    defaultViewport: {
      width: 1920,
      height: 1080
    },
    args: ['--lang=zh-cn']
  });
  
  logger.info("browser created")

  const page = await createPage(browser)
  await page.goto(mainUri, timeoutOption)
  await page.waitForSelector(".login-button", timeoutOption)
  logger.info("login button shown")

  await page.click('.login-button')
  let response = await page.waitForNavigation(timeoutOption);
  logger.info("go to uri is %s", response.url())

  response = await page.waitForNavigation(timeoutOption);
  // logger.info("go to uri is %s", response.url())

  const veriCodeRes = await page.waitForResponse(
    response => response.url().indexOf("GetVerificationCode") >= 0 && response.status() === 200, timeoutOption);
  logger.info("veri code got it")

  let imageName = getImageName("sso");
  await page.screenshot({ path: path.join(__dirname, imageName)});
  logger.info("screenshot finished, name is %s", imageName)

  const {Result:{Id}} = await veriCodeRes.json();
  logger.debug(`vericode id is ${Id}`)
  
  memClient.get(Id, async (err, val) => {
    const result = val.toString("utf8");
    logger.debug("veri code value is", result)

    await page.type("input[placeholder=请输入用户名]", username)
    await page.type("input[placeholder=请输入密码]", password)
    await page.type("input[placeholder=请输入图中算式结果]", result)

    let imageName = getImageName("sso-filled-in");
    await page.screenshot({ path: path.join(__dirname, imageName)}); 
    logger.info("screenshot finished, name is %s", imageName)

    
    let buttons = await page.$$(".pop-login-form-content-button button")
    await buttons[1].click()
    response = await page.waitForNavigation(timeoutOption);
    logger.info("uri change to %s", response.url())

    response = await page.waitForNavigation(timeoutOption)
    logger.info("uri change to %s", response.url())
    
    response = await page.waitForNavigation(timeoutOption)
    logger.info("uri change to %s", response.url())

    await page.waitForSelector(".jazz-select-customer-sp-manage", timeoutOption)
    logger.info("login success")

    imageName = getImageName("login-success");
    await page.screenshot({ path: path.join(__dirname, imageName) });
    logger.info("screenshot finished, name is %s", imageName)

    await page.click(".jazz-select-customer-sp-manage") //enter manage
    logger.info("enter management page success");

    await page.waitForSelector(".jazz-mainmenu-user") //wait for page
    logger.info("sidebar appear success");
    
    await page.click(".jazz-mainmenu-user>a") //click user
    logger.info("sidebar user clicked");

    await page.waitForSelector(".sidebar-bottom-action") //wait for sidebar
    logger.info("logout appear success");

    await page.click(".sidebar-bottom-action>button") //click logout
    logger.info("logout clicked");

    await page.waitForSelector(".dialog-actions") //wait for dialog
    logger.info("logout double confirmed shown");

    await page.click(".dialog-actions>button")
    logger.info("confirm click logout button");

    await page.waitForSelector("button.login-button")
    logger.info("logout success")


    imageName = getImageName("logout-success")
    await page.screenshot({ path: path.join(__dirname, imageName) }); 
    logger.info("screenshot finished, name is %s", imageName)

    await browser.close();
    logger.info("browser closed")

    await uploadAndCleanImage()
  })
}

function uploadAndCleanImage() {
  logger.info("ready upload images")
  let files = fs.readdirSync(__dirname);
  let date = moment();
  let folder = `paladin/${date.format("YYYY")}/${date.format("MM")}/${date.format("DD")}`;
  files.forEach(async (item: string) => {
    let fileName = `${folder}/${item}`;
    if(item.endsWith(".png")) {
      logger.debug("ready put item: ", fileName)
      let ret = await ossClient.put(fileName, path.join(__dirname, item))
      logger.info("file %s is uploaded", ret.name)
    }
  })

  cleanImage()
}

function cleanImage() {
  logger.info("ready clean Images")
  let files = fs.readdirSync(__dirname);
  files.forEach((item: string) => {
    let fileName = item;
    if(item.endsWith(".png")) {
      logger.debug("ready delete item: ", fileName)
      fs.unlinkSync(path.join(__dirname, fileName));
      logger.info("file %s is deleted", fileName)
    }
  })
}

// uploadAndCleanImage()
// cleanImage()
run();
// setInterval(run, 2 * 60 * 1000) //per 2 minutes