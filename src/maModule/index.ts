import * as config from "../prodConfig"
import * as puppeteer from "puppeteer"
import { getLogger } from "log4js"
import { screenshot, isLocatorReady } from '../util';
import {pushDuration, pushStatus} from '../pushGateway';
import maConfig from "./config"
import e = require("express");

const logger = getLogger("maModule");
const timeoutOption = { timeout: 15000 };
const PALADIN_EMOP_MAINURI = process.env["PALADIN_EMOP_MAIN_URI"];

/**
 * @description 单独校验每一个菜单的配置项
 * @param {*} item 菜单配置
 * @param {puppeteer.Page} page
 */
async function validMenu(config: config.Config, url: string, item: any, page: puppeteer.Page) {
  let startTime: any = new Date()
  let endTime: any = new Date()
  let duration: number = 0
  let rst = false;
  await page.goto(url, timeoutOption);
  for (let i = 0; i < item.validClass.length; i++) {
    let vc = item.validClass[i];
    let findElement;
    try {
      findElement = await page.waitForSelector(vc, timeoutOption);
      rst = await isLocatorReady(findElement, page);
      if (rst) {
        logger.debug(`menu ${item.name} element[${vc}] is shown`);
        break;
      }
      else  {
        logger.warn(`menu ${item.name} element[${vc}] was not shown`);
      }
    }
    catch {
      logger.warn(`menu ${item.name} element[${vc}] was not found or not shown`);
    }
  }
  if (rst) {
    logger.info(`menu ${item.name} element[${item.validClass}] check success`);
  } else {
    logger.error(`menu ${item.name} element[${item.validClass}] check failed`);
  }  
  var imgName = `${item.name}-${rst ? "success" :"error"}`;
  await screenshot(page, imgName);
  endTime = new Date();
  duration = (endTime - startTime) / 1000;
  pushDuration(config.prodAlias, duration,item.name);
  return rst;
}

function encodeId(id: any){
  var n = Number(id);
  return n.toString(16);
}

export async function main(config: config.Config, page: puppeteer.Page) {
  //to do here
  if (maConfig != null && maConfig.menuItems != null) {
    let emopHost = PALADIN_EMOP_MAINURI.split('/')[2];
    let spDomain = config.mainUri.replace("https://","").split('.')[0];
    logger.info(`get current spDomian from mainUrl ${spDomain}`);
    let cookieList = await page.cookies(config.mainUri);
    let cId = cookieList.find(cookie => cookie.name === 'CUSTOMERID').value;
    let cCode = encodeId(cId);
    logger.info(`get current customer from cookie ${cId} => ${cCode}`);
    let uId = cookieList.find(cookie => cookie.name === 'UserId').value;
    logger.info(`get current userId from cookie ${uId}`);
    // let linkList:string[] = await page.$$eval(maConfig.menuSelector, x => {
    //   return [...x].map(item => item.getAttribute("href"))
    // });
    // logger.info(linkList);
    let count = 0;
    for (let index = 0; index < maConfig.menuItems.length; index++) {
      const item = maConfig.menuItems[index];
      let url: string = "";
      url = item.url
        .replace("#cCode#", cCode)
        .replace("#cId#", cId)
        .replace("#uId#", uId)
        .replace("#spDomain#",spDomain)
        .replace("#EMOPHost#",emopHost);
      if (url && url != undefined && url != null && url.indexOf("/zh-cn") == 0) url = config.mainUri + url;            
      logger.info(`begin to check the menu ${item.name} and check url is ${url}`);
      if (url) {
        let rst = await validMenu(config, url, item, page);
        if (rst) count++; 
      }
    }
    //最外层已经有推送单次产品状态了
    //pushStatus(config.prodAlias, count < maConfig.menuItems.length ? 1 : 0);
  }
}
