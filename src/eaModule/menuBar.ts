import * as config from "../prodConfig";
import { buildingClassList, basicConfig } from "./config";
import * as puppeteer from "puppeteer";
import { getLogger } from "log4js";
import { screenshot, isLocatorReady } from "../util";
export interface PlainObject<T = any> {
  [key: string]: T;
}
const logger = getLogger("eaModule-menuBar");
const currentProd = process.env["PROD_NAME"];
const NAV_TIMEOUT = parseInt(process.env["NAV_TIMEOUT"] || "15");
const TimeOutOption: PlainObject = {
  waitUntil: ["domcontentloaded"],
  timeout: NAV_TIMEOUT * 1000
};
const AllMenuContainer = ".jazz-menu > *";
const SubMenuContainerSelector = '[role="menu"]';
const SubItemSelector = "[role='menu'] > div";
let OnlineMenuConfig: PlainObject = [];

async function handleCheckUnitPage(
  index: string,
  menu: PlainObject,
  page: puppeteer.Page,
  config: config.Config
) {
  const gotoSubMenuPage = async (params: PlainObject): Promise<void> => {
    const { idx, childConfig, parentEle } = params;
    logger.info("two menu");
    try {
      await parentEle.hover();
      await page.waitForSelector(SubMenuContainerSelector);

      const currentMenu = [...(await page.$$(SubItemSelector))][idx];

      time.before = new Date();
      await currentMenu.click();

      await page.waitFor(1000);
      const pageList = await page.browser().pages();

      let newPage = page;
      if (pageList.length > 2) {
        newPage = pageList[pageList.length - 1];
      }

      await newPage
        .waitForSelector(childConfig.checkSelector, TimeOutOption)
        .catch(e => {
          logger.warn(
            `no path menu ${childConfig.name} element[${childConfig.checkSelector}] was not found or not shown`
          );
        });

      time.after = new Date();

      // await handleScreenShot(time, childConfig.key, config, newPage);
    } catch (error) {
      // 捕获二级菜单错误
      return Promise.reject(childConfig);
    }
  };
  let time: PlainObject = {};
  try {
    const path = menu.href;
    logger.info(path, "path");
    // 一级菜单
    if (path) {
      time.before = new Date();
      await menu.ele.click();

      await page
        .waitForSelector(
          basicConfig[Number(index)].checkSelector,
          TimeOutOption
        )
        .catch((e: any) => {
          const ele = basicConfig[Number(index)];
          logger.warn(
            `path menu ${ele.name} element[${ele.checkSelector}] was not found or not shown checkSelector`
          );
        });
      await page
        .waitForSelector(basicConfig[Number(index)].validClass, TimeOutOption)
        .catch((e: any) => {
          const ele = basicConfig[Number(index)];
          logger.warn(
            `path menu ${ele.name} element[${ele.validClass}] was not found or not shown validClass`
          );
        });
      time.after = new Date();
      return time;
    }
    logger.info("no path");
    await menu.ele.hover();
    await page.waitForSelector(SubMenuContainerSelector);
    const subItems = await page.$$eval(SubItemSelector, submenu => {
      return [...submenu].map(item => {
        return {
          text: item.textContent
        };
      });
    });
    logger.info("subItems", subItems);
    for (let idx in subItems) {
      // 查找二级菜单子元素
      const childConfig = basicConfig[Number(index)].children[Number(idx)];
      // 如果是配置过的项目
      if (childConfig.name === subItems[idx].text) {
        await gotoSubMenuPage({
          idx,
          childConfig,
          parentEle: menu.ele
        }).catch(e => {
          logger.warn(`submenu ${e.name} was not found or not shown`);
        });
      }
    }
  } catch (error) {
    // 捕获一级菜单的错误
    const ele = basicConfig[Number(index)];
    return Promise.reject({
      page: ele.key,
      element: ele.checkSelector
    });
  }
}

async function selectMenu(config: config.Config, page: puppeteer.Page) {
  const onlineMenus = await page.$$(AllMenuContainer);
  logger.info("info Menu ");
  // 查找出所有线上的一级菜单名
  OnlineMenuConfig = await page.$$eval(AllMenuContainer, menus => {
    return [...menus].map(item => {
      return {
        href: item.getAttribute("href"),
        text: item.textContent
      };
    });
  });
  logger.info(OnlineMenuConfig, "OnlineMenuConfig");
  try {
    for (let index in onlineMenus) {
      // 未配置过的item 跳过
      logger.info("onlineMenus[index]");
      if (basicConfig[index].name !== OnlineMenuConfig[index].text) {
        return;
      }

      logger.info(basicConfig[index].name, "basicConfig ");
      OnlineMenuConfig[index]["ele"] = onlineMenus[index];
      const time = await handleCheckUnitPage(
        index,
        OnlineMenuConfig[index],
        page,
        config
      ).catch(async (e: any) => {
        await screenshot(page, `error-${e.page}`);
        logger.warn(`menu ${e.page} was not found submenu`);
      });

      // time &&
      //   (await handleScreenShot(
      //     time,
      //     basicConfig[Number(index)].key,
      //     config,
      //     page
      //   ));
    }
  } catch (e) {
    await screenshot(page, `error-unknown`);
    logger.warn(`page menus was not found or not shown`);
  }
}

export default async (config: config.Config, page: puppeteer.Page) => {
  logger.info("Into EA-menuBar");
  await selectMenu(config, page);
  logger.info("next");
};
