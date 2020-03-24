import { getLogger } from "log4js"
import * as request from "request"
import * as moment from "moment";
import * as fs from "fs";
import * as path from "path";
import * as OSS from "ali-oss";
import * as puppeteer from "puppeteer";


const logger = getLogger("util")

const TROJAN_HOST = process.env["TROJAN_HOST"]
const NODE_ENV = process.env["NODE_ENV"]

export function getValidationCode(id: string, callback: (code: string) => Promise<void>) {
  let uri = `${TROJAN_HOST}/validationCode/${id}`
  if (uri.indexOf("http") < 0) {
    uri = "https://" + uri
  }
  logger.info("trojan uri is %s", uri)
  request.get(uri, (error, response, body) => {
    if (error) {
      logger.error('error:', error)
      callback("")
    }
    else {
      logger.info("statusCode: %s, body: %s", response && response.statusCode, body)
      callback(body)
    }
  })
}

export function isMaintaining() {
  let status = process.env["IS_MAINTAINING"]
  if (status === "1") {
    return true
  }

  return false

}


function getImageName(key: string) {
  return `${key}-${moment().utcOffset(8).format("YYYY-MM-DD HHmmDD")}.png`
}

export async function screenshot(page: puppeteer.Page, name: string) {
  let imageName = getImageName(name)
  await page.screenshot({ path: path.join(__dirname, imageName) });
  logger.info("screenshot finished, name is %s", imageName)
}

export function cleanImage() {
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

export async function upload(prodName: string) {
  logger.info("ready upload images")
  let files = fs.readdirSync(__dirname);
  let date = moment().utcOffset(8)
  let folder = `paladin/${prodName}/${date.format("YYYY")}/${date.format("MM")}/${date.format("DD")}/${date.format("HH")}`;
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

export let ossClient: any = null;


export function initOssClient(endpoint: string, accessKeyId: string, accessKeySecret: string, bucket: string) {
  ossClient = new OSS({
    endpoint,
    accessKeyId,
    accessKeySecret,
    bucket,
    internal: NODE_ENV === "production" ? true : false
  });
}

export async function isLocatorReady(element: puppeteer.ElementHandle, page: puppeteer.Page) {
  const isVisibleHandle = await page.evaluateHandle((e) => {
    const style = window.getComputedStyle(e);
    return (style && style.display !== 'none' &&
      style.visibility !== 'hidden' && style.opacity !== '0');
  }, element);
  var visible = await isVisibleHandle.jsonValue();
  const box = await element.boxModel();
  if (visible && box) {
    return true;
  }
  return false;
}