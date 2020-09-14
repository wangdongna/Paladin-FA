import * as config from "../prodConfig";
import * as puppeteer from "puppeteer";
import { getLogger } from "log4js";
import { screenshot, isLocatorReady } from "../util";
import { pushDuration } from "../pushGateway";
import faConfig from "./navigationConfig";

const logger = getLogger("faModule");
const timeoutOption = { timeout: 20000 };

/**
 * @description 单独校验每一个菜单的配置项
 * @param {*} cfgItem 菜单配置
 * @param {puppeteer.Page} page
 */
async function validateMenu(
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
    await page.waitFor(20000);
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
        logger.info(`menu ${cfgItem.name} element[${vc}] is shown`);
      } else {
        logger.info(`menu ${cfgItem.name} element[${vc}] was not shown`);
      }
    } catch (e) {
      logger.info(
        `menu ${cfgItem.name} element[${vc}] was not found or not shown`
      );
    }
  }

  if (checkCount >= cfgItem.validClass.length) {
    logger.info(
      `menu ${cfgItem.name} element[${cfgItem.validClass}] check success`
    );
  } else {
    logger.info(
      `menu ${cfgItem.name} element[${cfgItem.validClass}] check failed`
    );
  }

  const imgName = `${cfgItem.name}-${rst ? "success" : "error"}`;
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
    let text = await eleMenu.evaluate(x => x.innerHTML);
    if (text != null && text.indexOf(cfgItem.itemSelector) >= 0) {
      rst = eleMenu;
      logger.info(
        `matched menu[${cfgItem.name}] selector[${cfgItem.itemSelector}]  text=${text}`
      );
      break;
    }
  }
  return rst;
}

export async function main(config: config.Config, page: puppeteer.Page) {
  if (!faConfig || !faConfig.menuItems) {
    return;
  }

  let rootMenuList = await page.$$(faConfig.menuSelector);
  await page.waitForSelector("div.pop-map-switch>a", timeoutOption);
  let mapItem = await page.$("div.pop-map-switch>a");
  let firstUrl = await mapItem.evaluate(x => x.getAttribute("href"));
  let mapIndex = firstUrl.indexOf("map");
  firstUrl = config.mainUri + firstUrl.substring(0, mapIndex - 1);
  logger.info("the first url is %s", firstUrl);

  for (let i = 0; i < faConfig.menuItems.length; i++) {
    let cfgItem = faConfig.menuItems[i];
    let lastCfgItem =
      i <= 1 ? faConfig.menuItems[0] : faConfig.menuItems[i - 1];
    let eleItem: puppeteer.ElementHandle<Element>;
    if (lastCfgItem.isOutLink) {
      //如果上次的连接时外链已经跳转到其他页面了，则首先跳回来
      logger.info(
        `last menu[${lastCfgItem.name}] is out link, page go back to first url: ${firstUrl}`
      );
      await page.goto(firstUrl);
      await page.waitForNavigation();
    }
    if (cfgItem.isSubMenu && cfgItem.hoverSelector != null) {
      await page.waitFor(500);
      await page.hover(cfgItem.hoverSelector);
      await page.waitFor(100);
      rootMenuList = await page.$$(cfgItem.subMenuSelector);
    } else {
      rootMenuList = await page.$$(faConfig.menuSelector);
    }

    eleItem = await getCheckElementHandle(page, rootMenuList, cfgItem);
    if (eleItem != null) {
      await validateMenu(config, eleItem, cfgItem, page);
    } else {
      logger.info(
        `menu ${cfgItem.name} element[${cfgItem.itemSelector}] was not found and not shown`
      );
    }
  }
}
