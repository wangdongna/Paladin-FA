import * as config from "../prodConfig"
import * as puppeteer from "puppeteer"
import { getLogger } from "log4js"
import { screenshot, isLocatorReady } from '../util';
import maConfig from "./config"

const logger = getLogger("maModule")
const timeoutOption = { timeout: 15000 }


/**
 * @description 单独校验每一个菜单的配置项
 * @param {*} item 菜单配置
 * @param {puppeteer.Page} page
 */
async function validMenu(item: any, page: puppeteer.Page) {
  await page.goto(item.url);
  let findElement = await page.waitForSelector(item.validClass, timeoutOption);
  if (findElement) {
    logger.info(`menu ${item.name} element[${item.validClass}] is shown`);
  }
  else {
    logger.error(`menu ${item.name} element[${item.validClass}] was not found`);
  }
  var imgName = `Hiphop-${item.name}`;
  await screenshot(page, imgName);
}

export async function main(config: config.Config, page: puppeteer.Page) {
  //to do here
  if (maConfig != null && maConfig.menuItems != null) {
    for (let index = 0; index < maConfig.menuItems.length; index++) {
      const item = maConfig.menuItems[index];
      await validMenu(item, page);      
    }
  }
}
