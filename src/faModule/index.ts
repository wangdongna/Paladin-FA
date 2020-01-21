import * as config from '../prodConfig';
import * as puppeteer from "puppeteer"
import { getLogger } from "log4js";
import { screenshot, isLocatorReady } from '../util';
import {pushDuration} from '../pushGateway';
import faConfig from "./config"
import e = require("express");

const logger = getLogger("faModule")
const timeoutOption = { timeout: 10000 };
const timeoutOptionLong = { timeout: 30000 };

/**
 * @description 单独校验每一个菜单的配置项
 * @param {*} cfgItem 菜单配置
 * @param {puppeteer.Page} page
 */
async function validMenu(config: config.Config, eleItem: puppeteer.ElementHandle<Element>, cfgItem: any, page: puppeteer.Page) {
  let startTime: any = new Date()
  let endTime: any = new Date()
  let duration: number = 0
  let rst = false;
  let currentPage = page;
  eleItem.click();
  if (cfgItem.isOutLink)
  {
    await page.waitFor(20000);
    const pageList = await page.browser().pages();
    currentPage = pageList[pageList.length - 1];
  } 
  let checkCount = 0;
  for (let i = 0; i < cfgItem.validClass.length; i++) {
    let vc = cfgItem.validClass[i];
    let findElement : puppeteer.ElementHandle<Element>;
    try {
      findElement = await currentPage.waitForSelector(vc, timeoutOption);
      rst = await isLocatorReady(findElement, currentPage);
      if (rst) {
        checkCount++;
        logger.info(`menu ${cfgItem.name} element[${vc}] is shown`);
      }
      else  {
        logger.info(`menu ${cfgItem.name} element[${vc}] was not shown`);
      }
    }
    catch {
      logger.info(`menu ${cfgItem.name} element[${vc}] was not found or not shown`);
    }
  }
  if (checkCount >= cfgItem.validClass.length) {
    logger.info(`menu ${cfgItem.name} element[${cfgItem.validClass}] check success`);
  } else {
    logger.info(`menu ${cfgItem.name} element[${cfgItem.validClass}] check failed`);
  }  
  var imgName = `${cfgItem.name}-${rst ? "success" :"error"}`;
  await screenshot(currentPage, imgName);
  endTime = new Date();
  duration = (endTime - startTime) / 1000;
  pushDuration(config.prodAlias, duration,cfgItem.name);
  return rst;
}

async function getCheckElementHandle(page: puppeteer.Page, menuList: puppeteer.ElementHandle<Element>[], cfgItem : any) :  Promise<puppeteer.ElementHandle<Element>> {
  let rst: puppeteer.ElementHandle<Element>;
  for (let i = 0; i < menuList.length; i++) {
    let eleMenu = menuList[i];
    let text = await eleMenu.evaluate(x => x.innerHTML);
    if (text != null && text.indexOf(cfgItem.itemSelector) >= 0){
      rst = eleMenu;
      logger.info(`matched menu[${cfgItem.name}] selector[${cfgItem.itemSelector}]  text=${text}`);
      break;
    }    
  }
  return rst;
}

export async function main(config: config.Config, page: puppeteer.Page) {
  if (faConfig != null && faConfig.menuItems != null) {
    let rootMenuList = await page.$$(faConfig.menuSelector);
    await page.waitForSelector("div.pop-map-switch>a", timeoutOption);
    let mapItem = await page.$("div.pop-map-switch>a");
    let firstUrl = await mapItem.evaluate(x => x.getAttribute("href"));
    let mapIndex = firstUrl.indexOf("map");
    firstUrl = config.mainUri + firstUrl.substring(0,mapIndex-1);
    logger.info("the first url is %s", firstUrl);
    for (let i = 0; i < faConfig.menuItems.length; i++) {
      let cfgItem = faConfig.menuItems[i];
      let lastCfgItem = i <= 1 ? faConfig.menuItems[0] : faConfig.menuItems[i-1];
      let eleItem : puppeteer.ElementHandle<Element>;
      if (lastCfgItem.isOutLink) {  //如果上次的连接时外链已经跳转到其他页面了，则首先跳回来
        logger.info(`last menu[${lastCfgItem.name}] is out link, page go back to first url: ${firstUrl}`);
        await page.goto(firstUrl);
        await page.waitForNavigation();
      }
      if (cfgItem.isSubMenu && cfgItem.hoverSelector != null) {
        await page.hover(cfgItem.hoverSelector);
        rootMenuList = await page.$$(cfgItem.subMenuSelector);   
      }
      else {
        rootMenuList = await page.$$(faConfig.menuSelector);
      }

      eleItem = await getCheckElementHandle(page, rootMenuList, cfgItem);
      if (eleItem != null) {
        await validMenu(config, eleItem, cfgItem, page);
      }
      else {
        logger.info(`menu ${cfgItem.name} element[${cfgItem.itemSelector}] was not found and not shown`);
      }
    }
  }
}

// export async function main(config: config.Config, page: puppeteer.Page) {
//   let rootMenuList = await page.$$("li.ant-menu-item");
//   let eleItem : puppeteer.ElementHandle<Element>;
//   let rst = false;
//   let findElement : puppeteer.ElementHandle<Element>;
//   let currentPage = page;
//   findElement = await page.waitForSelector("div.pop-map-switch>a", timeoutOption);
//   let mapItem = await page.$("div.pop-map-switch>a");
//   let firstUrl = await mapItem.evaluate(x => x.getAttribute("href"));
//   let mapIndex = firstUrl.indexOf("map");
//   firstUrl = config.mainUri + firstUrl.substring(0,mapIndex-1);
//   logger.info("the first url is %s", firstUrl);
//   await page.waitForSelector("span.asset-view-item-content", timeoutOption);
//   await screenshot(page, "after-asset-detail");  
//   await page.waitFor(2000);


//   eleItem = rootMenuList[1];
//   eleItem.click();
//   findElement = await page.waitForSelector("div.pop-alarm", timeoutOption);
//   rst = await isLocatorReady(findElement, page);
//   var imgName = `alarm-${rst ? "success" :"error"}`;
//   await screenshot(page, imgName);

//   // eleItem = rootMenuList[2];
//   // eleItem.click();
//   // findElement = await page.waitForSelector("div.pop-doc", timeoutOption);
//   // rst = await isLocatorReady(findElement, page);
//   // var imgName = `doc-${rst ? "success" :"error"}`;
//   // await screenshot(page, imgName);

//   // eleItem = rootMenuList[3];
//   // eleItem.click();
//   // findElement = await page.waitForSelector("div.pop-report", timeoutOption);
//   // rst = await isLocatorReady(findElement, page);
//   // var imgName = `report-${rst ? "success" :"error"}`;
//   // await screenshot(page, imgName);

//   // await page.hover("ul.ant-menu.menu-content>:nth-child(6)");
//   // findElement = await page.waitForSelector("div.ant-menu-submenu.ant-menu-submenu-popup>ul>li", timeoutOption);
//   // rst = await isLocatorReady(findElement, page);
//   // var imgName = `hoverResult-${rst ? "success" :"error"}`;
//   // await screenshot(page, imgName);
//   // let subMenuList = await page.$("div.ant-menu-submenu.ant-menu-submenu-popup>ul>li");
//   // logger.info("the hover result %s", subMenuList);
//   // eleItem = subMenuList;
//   // eleItem.click();
//   // findElement = await page.waitForSelector("div.ant-row.plan-management-main-page", timeoutOption);
//   // rst = await isLocatorReady(findElement, page);
//   // var imgName = `maintainplan-${rst ? "success" :"error"}`;
//   // await screenshot(page, imgName);

//   // await page.hover("ul.ant-menu.menu-content>:nth-child(12)");
//   // findElement = await page.waitForSelector("ul[id*=diagnose]>li", timeoutOption);
//   // rst = await isLocatorReady(findElement, page);
//   // var imgName = `hoverResult-${rst ? "success" :"error"}`;
//   // await screenshot(page, imgName);
//   // let subMenuList = await page.$$("ul[id*=diagnose]>li");
//   // logger.info("the hover result %s", subMenuList);
//   // eleItem = subMenuList[3];
//   // await screenshot(page, "before click tag management");
//   // eleItem.click();
//   // await page.waitFor(2000);
//   // const pageList = await page.browser().pages();
//   // currentPage = pageList[pageList.length - 1];
//   // await screenshot(currentPage, "in tag management page");
//   // findElement = await currentPage.waitForSelector("div.dropdown-group", timeoutOptionLong);
//   // rst = await isLocatorReady(findElement, currentPage);
//   // var imgName = `tag-${rst ? "success" :"error"}`;
//   // await screenshot(currentPage, imgName);


//   await page.hover("ul.ant-menu.menu-content>:nth-child(14)");
//   findElement = await page.waitForSelector("ul[id*=gateway]>li", timeoutOption);
//   rst = await isLocatorReady(findElement, page);
//   var imgName = `hoverResult-${rst ? "success" :"error"}`;
//   await screenshot(page, imgName);
//   let subMenuList = await page.$$("ul[id*=gateway]>li");
//   logger.info("the hover result %s", subMenuList);
//   eleItem = subMenuList[4];
//   await screenshot(page, "before click gateway management");
//   eleItem.click();
//   await page.waitFor(10000);
//   const pageList = await page.browser().pages();
//   currentPage = pageList[pageList.length - 1];
//   await screenshot(currentPage, "in gateway management page");
//   findElement = await currentPage.waitForSelector("div.template", timeoutOptionLong);
//   rst = await isLocatorReady(findElement, currentPage);
//   var imgName = `template-${rst ? "success" :"error"}`;
//   await screenshot(currentPage, imgName);

//   logger.info(`last one is out link, page go back to first url: ${firstUrl}`);
//   await currentPage.goto(firstUrl);
//   await currentPage.waitForNavigation();
//   eleItem = rootMenuList[4];
//   await screenshot(currentPage, "before - click - dashboard");
//   eleItem.click();
//   await currentPage.waitFor(10000);
//   const pageLista = await currentPage.browser().pages();
//   currentPage = pageLista[pageList.length - 1];
//   await screenshot(currentPage, "after - click - dashboard");
//   findElement = await currentPage.waitForSelector("div.board-view-top-menu", timeoutOptionLong);
//   rst = await isLocatorReady(findElement, currentPage);
//   var imgName = `dasoboard-${rst ? "success" :"error"}`;
//   await screenshot(currentPage, imgName);
// }
