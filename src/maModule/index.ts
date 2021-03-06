import * as config from "../prodConfig";
import * as puppeteer from "puppeteer";
import { getLogger } from "log4js";
import { screenshot, isLocatorReady } from "../util";
import { pushDuration, pushMenuStatus } from "../pushGateway";
import maConfig from "./config";
import e = require("express");

const logger = getLogger("maModule");
const timeoutOption = { timeout: 10000 };

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
  let rst = null;
  let currentPage = page;
  eleItem.click();
  if (cfgItem.isOutLink) {
    await page.waitFor(1000);
    const pageList = await page.browser().pages();
    currentPage = pageList[pageList.length - 1];
  }
  let checkCount = 0;
  for (let i = 0; i < cfgItem.validClass.length; i++) {
    let vc = cfgItem.validClass[i];
    let findElement: puppeteer.ElementHandle<Element>;
    try {
      findElement = await currentPage.waitForSelector(vc, timeoutOption);
      rst = await isLocatorReady(findElement, currentPage);
      if (rst) {
        checkCount++;
        logger.debug(`menu ${cfgItem.name} element[${vc}] is shown`);
      } else {
        logger.warn(`menu ${cfgItem.name} element[${vc}] was not shown`);
      }
    } catch {
      logger.warn(
        `menu ${cfgItem.name} element[${vc}] was not found or not shown`
      );
    }
  }
  if (checkCount >= cfgItem.validClass.length) {
    logger.info(
      `menu ${cfgItem.name} element[${cfgItem.validClass}] check success`
    );
    pushMenuStatus(config.prodAlias, cfgItem.name, 0);
  } else {
    logger.error(
      `menu ${cfgItem.name} element[${cfgItem.validClass}] check failed`
    );
    pushMenuStatus(config.prodAlias, cfgItem.name, 1);
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
    let href = await eleMenu.evaluate(x => x.getAttribute("href"));
    let text = await eleMenu.evaluate(x => x.innerHTML);
    if (
      (href != null && href.indexOf(cfgItem.itemSelector) >= 0) ||
      (text != null && text.indexOf(cfgItem.itemSelector) >= 0)
    ) {
      rst = eleMenu;
      logger.debug(
        `matched menu[${cfgItem.name}] selector[${cfgItem.itemSelector}] href=${href}  text=${text}`
      );
      break;
    }
  }
  return rst;
}

export async function main(config: config.Config, page: puppeteer.Page) {
  if (maConfig != null && maConfig.menuItems != null) {
    let rootMenuList = await page.$$(maConfig.menuSelector);
    let firstUrl = await rootMenuList[0].evaluate(x => x.getAttribute("href"));
    firstUrl = config.mainUri + firstUrl;
    for (let i = 0; i < maConfig.menuItems.length; i++) {
      let cfgItem = maConfig.menuItems[i];
      let lastCfgItem =
        i <= 1 ? maConfig.menuItems[0] : maConfig.menuItems[i - 1];
      let eleItem: puppeteer.ElementHandle<Element>;
      if (lastCfgItem.isOutLink) {
        //如果上次的连接时外链已经跳转到其他页面了，则首先跳回来
        logger.debug(
          `last menu[${lastCfgItem.name}] is out link, page go back to first url: ${firstUrl}`
        );
        await page.goto(firstUrl);
        await page.waitForNavigation();
      }
      if (cfgItem.isSubMenu && cfgItem.hoverSelector != null) {
        await page.hover(cfgItem.hoverSelector);
        rootMenuList = await page.$$(cfgItem.subMenuSelector);
      } else {
        rootMenuList = await page.$$(maConfig.menuSelector);
      }

      eleItem = await getCheckElementHandle(page, rootMenuList, cfgItem);
      if (eleItem != null) {
        await validMenu(config, eleItem, cfgItem, page);
      } else {
        logger.warn(
          `menu ${cfgItem.name} element[${cfgItem.itemSelector}] was not found and not shown`
        );
      }
    }
  }
}
