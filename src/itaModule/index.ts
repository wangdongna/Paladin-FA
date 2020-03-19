import * as config from "../prodConfig";
import * as puppeteer from "puppeteer";
import { getLogger } from "log4js";
import { screenshot, isLocatorReady } from "../util";
import { pushDuration } from "../pushGateway";
import itaConfig from "./config";
import e = require("express");

const logger = getLogger("itaModule");
const NAV_TIMEOUT = parseInt(process.env["NAV_TIMEOUT"] || "15");
const timeoutOption = { timeout: NAV_TIMEOUT * 1000 };
let pageFirstUrl;

/**
 * @description 单独校验每一个菜单的配置项
 * @param {*} cfgItem 菜单配置
 * @param {puppeteer.Page} page
 */
async function validMenu(
  config: config.Config,
  eleItem: puppeteer.ElementHandle<Element>,
  cfgItem: any,
  page: puppeteer.Page
) {
  let startTime: any = new Date();
  let endTime: any = new Date();
  let duration: number = 0;
  let rst = false;
  let currentPage = page;
  eleItem.click();
  if (cfgItem.isOutLink) {
    await page.waitFor(1000);
    const pageList = await page.browser().pages();
    currentPage = pageList[pageList.length - 1];
  }
  let vc = cfgItem.validClass;
  let findElement: puppeteer.ElementHandle<Element>;
  try {
    findElement = await currentPage.waitForSelector(vc, timeoutOption);
    rst = await isLocatorReady(findElement, currentPage);
    if (rst) {
      logger.debug(`menu ${cfgItem.name} element[${vc}] is shown`);
    } else {
      logger.warn(`menu ${cfgItem.name} element[${vc}] was not shown`);
    }
  } catch {
    logger.warn(
      `menu ${cfgItem.name} element[${vc}] was not found or not shown`
    );
  }
  var imgName = `${cfgItem.name}-${rst ? "success" : "error"}`;
  await screenshot(currentPage, imgName);
  endTime = new Date();
  duration = (endTime - startTime) / 1000;
  pushDuration(config.prodAlias, duration, cfgItem.name);
  return rst;
}

async function getCheckElementHandle(
  page: puppeteer.Page,
  menuList: puppeteer.ElementHandle<Element>[],
  cfgItem: any
): Promise<puppeteer.ElementHandle<Element>> {
  let rst: puppeteer.ElementHandle<Element>;
  for (let i = 0; i < menuList.length; i++) {
    let eleMenu = menuList[i];
    let text = await eleMenu.evaluate(x => x.textContent);
    if (text === cfgItem.text) {
      rst = eleMenu;
      logger.debug(`matched menu[${cfgItem.name}] text=${text}`);
      break;
    }
  }
  return rst;
}
async function validTaskCenter(
  config: config.Config,
  eleItemTask: puppeteer.ElementHandle<Element>,
  cfgItemTask: any,
  page: puppeteer.Page) {
  let startTime: any = new Date();
  let endTime: any = new Date();
  let duration: number = 0;
  let rst;
  let currentPage = page;
  try {
    eleItemTask.click();
    await page.waitFor(1000);
    rst = await page.$(cfgItemTask.validClass)
    var imgName = `${cfgItemTask.name}-${rst ? "success" : "error"}`;
    await screenshot(currentPage, imgName);
    endTime = new Date();
    duration = (endTime - startTime) / 1000;
    pushDuration(config.prodAlias, duration, cfgItemTask.name);
    return rst;
  } catch {
    logger.warn(`task center not found`)
  }
}


export async function main(config: config.Config, page: puppeteer.Page) {
  pageFirstUrl = page.url();
  if (itaConfig != null && itaConfig.menuItems != null) {
    let rootMenuList = await page.$$(itaConfig.menuSelector);
    for (let i = 0; i < itaConfig.menuItems.length; i++) {
      let cfgItem = itaConfig.menuItems[i];
      logger.info(`currently checking ${cfgItem.text}`);
      let lastCfgItem =
        i <= 1 ? itaConfig.menuItems[0] : itaConfig.menuItems[i - 1];
      let eleItem: puppeteer.ElementHandle<Element>;
      if (lastCfgItem.isOutLink) {
        //如果上次的连接时外链已经跳转到其他页面了，则首先跳回来
        logger.debug(
          `last menu[${lastCfgItem.name}] is out link, page go back to first url: `
        );
        // await page.bringToFront(); // 返回上一页
        await page.goto(pageFirstUrl, timeoutOption);
        await page.waitForNavigation();
      }
      if (cfgItem.isSubMenu && cfgItem.hoverSelector != null) {
        await page.hover(cfgItem.hoverSelector);
        await page.waitFor(1000);
        rootMenuList = await page.$$(cfgItem.subMenuSelector);
      } else {
        rootMenuList = await page.$$(itaConfig.menuSelector);
      }

      eleItem = await getCheckElementHandle(page, rootMenuList, cfgItem);
      if (eleItem != null) {
        await validMenu(config, eleItem, cfgItem, page);
        let eleItemTask = await page.$('.task-center')
        let cfgItemTask = itaConfig.taskCenterItem
        await validTaskCenter(config, eleItemTask, cfgItemTask,page);
      } else {
        logger.info("eleItem", eleItem);
        logger.warn(`menu ${cfgItem.name} was not found and not shown`);
      }
    }

  }
}
