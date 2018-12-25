import * as config from './prodConfig';
import * as puppeteer from "puppeteer"
import * as moment from "moment"
import * as path from "path"
import * as memjs from "memjs"
import { configure, getLogger } from "log4js";
import logConfig from "./logConfig";
import * as fs from "fs";
import * as OSS from "ali-oss"
import notification from "./notification";

const LOG_LEVEL = process.env["LOG_LEVEL"] || "DEBUG"

configure(logConfig(LOG_LEVEL))

const logger = getLogger("index")
const endpoint = process.env["ALI_SDK_OSS_ENDPOINT"]
const accessKeySecret = process.env["ALI_SDK_STS_SECRET"]
const accessKeyId = process.env["ALI_SDK_STS_ID"]
const bucket = process.env["OSS_DATA_BUCKET"]
const NODE_ENV = process.env["NODE_ENV"]
const PALADIN_ENV = process.env["PALADIN_ENV"]



let envArgs: Array<string> = ["LOG_LEVEL", "NODE_ENV", "PALADIN_ENV", "ALI_SDK_OSS_ENDPOINT", "OSS_DATA_BUCKET", "ALI_SDK_STS_SECRET", "ALI_SDK_STS_ID"]

envArgs.forEach((item: string) => {
  let ret = false;
  let val = process.env[item]
  if(!val) {
    logger.fatal("env var %s missing", item)
    ret = true
  }
  else {
    logger.debug("%s is %s", item, val)
  }
  if(ret) {
    process.exit(1);
  }
})

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
  return `${key}-${moment().utcOffset(8).toISOString(true)}.png`
}

const timeoutOption = {timeout: 10 * 1000} // timeout is 10 seconds
 
async function run(config: config.Config) {
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
  await page.goto(config.mainUri, timeoutOption)
  await page.waitForSelector(config.loginButtonClass, timeoutOption)
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
    try {
      const result = val.toString("utf8");
      logger.debug("veri code value is", result)
  
      await page.type("input[placeholder=请输入用户名]", config.username)
      await page.type("input[placeholder=请输入密码]", config.password)
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
  
      await page.waitForSelector(config.spMgmtClass, timeoutOption)
      logger.info("login success")
  
      imageName = getImageName("login-success");
      await page.screenshot({ path: path.join(__dirname, imageName) });
      logger.info("screenshot finished, name is %s", imageName)
  
      await page.click(config.spMgmtClass) //enter manage
      logger.info("enter management page success");
  
      await page.waitForSelector(config.userClass) //wait for page
      logger.info("sidebar appear success");
      
      await page.click(config.userClass) //click user
      logger.info("sidebar user clicked");
  
      await page.waitForSelector(".sidebar-bottom-action") //wait for sidebar
      logger.info("logout appear success");
  
      await page.click(".sidebar-bottom-action>button") //click logout
      logger.info("logout clicked");
  
      await page.waitForSelector(".dialog-actions") //wait for dialog
      logger.info("logout double confirmed shown");
  
      await page.click(".dialog-actions>button")
      logger.info("confirm click logout button");
  
      await page.waitForSelector(config.loginButtonClass)
      logger.info("logout success")
  
  
      imageName = getImageName("logout-success")
      await page.screenshot({ path: path.join(__dirname, imageName) }); 
      logger.info("screenshot finished, name is %s", imageName)
  
      await browser.close();
      logger.info("browser closed")
   
      await uploadAndCleanImage(config)
    }
    catch(error) {
      notification.sendEmail(error)
      notification.sendSMS()
    }
    
  })
}

function uploadAndCleanImage(config: config.Config) {
  logger.info("ready upload images")
  let files = fs.readdirSync(__dirname);
  let date = moment().utcOffset(8)
  let folder = `paladin/${config.prodName}/${date.format("YYYY")}/${date.format("MM")}/${date.format("DD")}/${date.format("HH")}`;
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
try {
  
  for(let i=0; i< config.configList.length; ++i){
    run(config.configList[i]);
  }
}
catch(error) {
  notification.sendEmail(error)
  notification.sendSMS()
}

// setInterval(run, 2 * 60 * 1000) //per 2 minutes