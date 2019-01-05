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
const endpoint = process.env["HARDCORE_OSS_ENDPOINT"]
const accessKeySecret = process.env["ALI_SDK_STS_SECRET"]
const accessKeyId = process.env["ALI_SDK_STS_ID"]
const bucket = process.env["OSS_BUCKET_DATA"]
const NODE_ENV = process.env["NODE_ENV"]
const DOCKER_TYPE = process.env["DOCKER_TYPE"]



let envArgs: Array<string> = ["CLASSIC_OCS_HOST", "CLASSIC_OCS_PORT", "CLASSIC_OCS_USERNAME", "CLASSIC_OCS_PASSWORD", "LOG_LEVEL", "NODE_ENV", "HARDCORE_OSS_ENDPOINT", "OSS_BUCKET_DATA", "ALI_SDK_STS_SECRET", "ALI_SDK_STS_ID"]

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
  const page = await browser.newPage();
  // page.setCacheEnabled(false)
  page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36 Paladin")
  return page;
}

function createMemClient() {
  const connStr = `${process.env["CLASSIC_OCS_USERNAME"]}:${process.env["CLASSIC_OCS_PASSWORD"]}@${process.env["CLASSIC_OCS_HOST"]}:${process.env["CLASSIC_OCS_PORT"]}`
  logger.info("memcache client connection string : %s", connStr)
  const memClient = memjs.Client.create(connStr)
  logger.info("memcache client created")
  return memClient;
}

function getImageName(key: string) {
  return `${key}-${moment().utcOffset(8).format("YYYY-MM-DD HH:mm:DD")}.png`
}

const TIMEOUT = process.env["TIMEOUT"] || "60";

const timeoutOption = {timeout: parseInt(TIMEOUT) * 1000} // timeout is 60 seconds

const navigationOption = Object.assign({}, timeoutOption, {waitUntil: ["domcontentloaded"]})
const navigationIdleOption = Object.assign({}, timeoutOption, {waitUntil: ["networkidle0"]})

const memClient = createMemClient()

 
async function run(page: puppeteer.Page, config: config.Config) {
  console.time(config.prodName)

  let response = await page.goto(config.mainUri, timeoutOption)
  if(response) {
    logger.info("enter page: %s", response.url())
  }
  else {
    logger.error("fail to enter page: %s", config.mainUri)
    //skip this case 
    return
  }
  

  let loginButton = await page.waitForSelector(config.loginButtonClass, timeoutOption)
  if(loginButton) {
    logger.info("login button shown")
    let imageName = getImageName("mainpage");
    await page.screenshot({ path: path.join(__dirname, imageName)});
  }
  else {
    logger.info("login button not shown, url is: %s", page.url())
    throw new Error("unknow error")
  }
  

  let responses = await Promise.all([
    await page.click(config.loginButtonClass),
    await page.waitForNavigation(navigationOption),
    // await page.waitForNavigation(navigationOption)
  ])
  logger.info("entering sso page")
  
  responses.forEach((item: any) => {
    if(item && item.url) {
      logger.info("url change to %s", item.url());
    }
  })
  

  const veriCodeRes = await page.waitForResponse(
    response => response.url().indexOf("GetVerificationCode") >= 0 && response.status() === 200, timeoutOption);
  logger.info("veri code got it")

  let imageName = getImageName("sso");
  await page.screenshot({ path: path.join(__dirname, imageName)});
  logger.info("screenshot finished, name is %s", imageName)

  const {Result:{Id}} = await veriCodeRes.json();
  logger.debug(`vericode id is ${Id}`)

  await new Promise((resolve, reject) => {
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
        let responses = await Promise.all([
          await buttons[1].click(),
          await page.waitForNavigation(navigationOption),
          await page.waitForNavigation(navigationOption),
          await page.waitForNavigation(navigationIdleOption),
        ])
        logger.info("customer selection shown")
        responses.forEach((item: any) => {
          if(item && item.url){
            logger.info("uri change to %s", item.url())
          }
        })
        
    
        await page.waitForSelector(config.spMgmtClass, timeoutOption)
        await page.waitFor(10 * 1000); //wait for 10 seconds
        logger.info("login success") 
        
    
        imageName = getImageName("login-success");
        await page.screenshot({ path: path.join(__dirname, imageName) });
        logger.info("screenshot finished, name is %s", imageName)
    
        await logoutProcess(page, config)

        console.timeEnd(config.prodName)

        resolve()
      }
      catch(error) { 
        logger.error(error)
        reject(error)
      }
    })
  })
  
  
}

async function logoutProcess(page: puppeteer.Page, config: config.Config) {
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

  await page.waitForSelector(config.loginButtonClass, timeoutOption)
  logger.info("logout success")


  let imageName = getImageName("logout-success")
  await page.screenshot({ path: path.join(__dirname, imageName) }); 
  logger.info("screenshot finished, name is %s", imageName)

}

async function upload(config: config.Config) {
  logger.info("ready upload images") 
  let files = fs.readdirSync(__dirname);
  let date = moment().utcOffset(8)
  let folder = `paladin/${config.prodName}/${date.format("YYYY")}/${date.format("MM")}/${date.format("DD")}/${date.format("HH")}`;
  for(let i=0;i< files.length; ++i) {
    let item = files[i];
    let fileName = `${folder}/${item}`;
    if(item.endsWith(".png")) {
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
    if(item.endsWith(".png")) {
      logger.debug("ready delete item: ", fileName)
      let filePath = path.join(__dirname, fileName) 
      if(fs.existsSync(filePath)){
        fs.unlinkSync(filePath);
        logger.info("file %s is deleted", fileName)
      }
      
    }
  })
}

// uploadAndCleanImage()
// cleanImage()
async function start(){
  for(let i=0; i< config.configList.length; ++i){
    const browser = await puppeteer.launch({
      defaultViewport: {
        width: 1920,
        height: 1080
      },
      args: ['--lang=zh-cn', '--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox'] 
    });

    let config1 = config.configList[i]
    const page = await createPage(browser)
    logger.info("page created for: %s", config1.prodName)
    try {
      await run(page, config1);
      await page.close()
      notification.success(config1.prodName)
    }
    catch(error) {
      logger.error(error)
      logger.error(page.url())
      let errorFileName = getImageName("error")
      await page.screenshot({ path: path.join(__dirname, errorFileName)});
      await page.close()
      notification.error(config1.prodName, error)
    }
    finally {
      await upload(config1)
      cleanImage()
      await browser.close();
      logger.info("browser closed")
    }
  }
}
// start();
if(DOCKER_TYPE === "swarm" || DOCKER_TYPE === "k8s"){
  start()
  setInterval(async ()=> {
    await start()
  }, 5 * 60 * 1000) //per 5 minutes
}
else {
  start();
}
