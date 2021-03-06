import * as config from "../prodConfig";
import * as puppeteer from "puppeteer";
import { getLogger } from "log4js";
import { screenshot } from "../util";
import { pushDuration, pushMenuStatus } from "../pushGateway";

const logger = getLogger("daModule");

export interface MenuItemConfig {
  /** 菜单名称 */
  key: string;

  /** 用于匹配是否存在配置内 */
  name: string;

  /** 页面待检查的元素 */
  checkpointSelector?: string;

  /** 子元素节点 */
  children?: MenuItemConfig[];

  /** 指定跳转的url地址 */
  url?: string;
}
export interface PlainObject<T = any> {
  [key: string]: T;
}

let OnlineMenuConfig: PlainObject = [];
const MenuContainerSelector = ".pop-menu > *";
const SubMenuContainerSelector = '[role="menu"]';
const SubItemSelector = '[role="menu"] > li';
const NAV_TIMEOUT = parseInt(process.env["NAV_TIMEOUT"] || "15");
const TimeOutOption: PlainObject = {
  waitUntil: ["domcontentloaded"],
  timeout: NAV_TIMEOUT * 1000
};

const basicConfig: Array<MenuItemConfig> = [
  {
    key: "assets",
    name: "我的设备",
    checkpointSelector: ".pop-asset"
  },
  {
    key: "alarm",
    name: "故障报警",
    checkpointSelector: ".pop-alarm"
  },
  {
    key: "maintenance",
    name: "维护计划",
    checkpointSelector: ".maintenance"
  },
  {
    key: "ticket",
    name: "工单管理",
    checkpointSelector: ".ticket-list"
  },
  {
    key: "doc",
    name: "文档管理",
    checkpointSelector: ".pop-doc"
  },
  {
    key: "report",
    name: "报告管理",
    checkpointSelector: ".pop-report"
  },
  {
    key: "gateway",
    name: "网关管理",
    children: [
      {
        key: "comxbox",
        name: "ComX BOX",
        checkpointSelector: ".new-gateway"
      }
    ]
  }
];

const handleCheckUnitPage = async (
  index: Number,
  menu: PlainObject,
  page: puppeteer.Page,
  config: config.Config
): Promise<any> => {
  let time: PlainObject = {};

  const gotoSubMenuPage = async (params: PlainObject): Promise<void> => {
    const { idx, childConfig, parentEle } = params;

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
        .waitForSelector(childConfig.checkpointSelector, TimeOutOption)
        .catch(e => {
          logger.warn(
            `menu ${childConfig.name} element[${childConfig.checkpointSelector}] was not found or not shown`
          );
        });

      time.after = new Date();

      await handleScreenShot(time, childConfig.key, config, newPage);
    } catch (error) {
      // 捕获二级菜单错误
      return Promise.reject(childConfig);
    }
  };

  try {
    const path = menu.href;

    // 一级菜单
    if (path) {
      time.before = new Date();
      await menu.ele.click();

      await page
        .waitForSelector(
          basicConfig[Number(index)].checkpointSelector,
          TimeOutOption
        )
        .catch(e => {
          const ele = basicConfig[Number(index)];
          logger.warn(
            `menu ${ele.name} element[${ele.checkpointSelector}] was not found or not shown`
          );
        });

      time.after = new Date();

      return time;
    }

    await menu.ele.hover();
    await page.waitForSelector(SubMenuContainerSelector);

    const subItems = await page.$$eval(SubItemSelector, submenu => {
      return [...submenu].map(item => {
        return {
          text: item.textContent
        };
      });
    });

    for (let idx in subItems) {
      // 查找二级菜单子元素
      const childConfig = basicConfig[Number(index)].children[Number(idx)];
      // 如果是配置过的项目
      if (childConfig && childConfig.name === subItems[idx].text) {
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
      element: ele.checkpointSelector
    });
  }
};

const handleScreenShot = async (
  t: PlainObject,
  screenname: string,
  config: config.Config,
  page: puppeteer.Page
) => {
  const duration = (t.after - t.before) / 1000;

  pushDuration(config.prodAlias, duration, screenname);

  // 处理是否超时的逻辑
  if (Math.round(duration) < Number(NAV_TIMEOUT)) {
    await screenshot(page, `${screenname}-success`);
    pushMenuStatus(config.prodAlias, screenname, 0);
    logger.info(`menu ${screenname} check success`);
  } else {
    await screenshot(page, `error-${screenname}`);
    pushMenuStatus(config.prodAlias, screenname, 1);
    logger.info(`menu ${screenname} check outtime`);
  }
};

export async function main(config: config.Config, page: puppeteer.Page) {
  logger.info("Into DA-Main");

  const onlineMenus = await page.$$(MenuContainerSelector);

  await page.waitFor(500);
  // 查找出所有线上的一级菜单名
  OnlineMenuConfig = await page.$$eval(MenuContainerSelector, menus => {
    return [...menus].map(item => {
      return {
        href: item.getAttribute("href"),
        text: item.textContent
      };
    });
  });

  try {
    for (let index in onlineMenus) {
      // 未配置过的item 跳过, 有些item后可能跟报警数值
      const currentMenuIndex = basicConfig.findIndex(
        i =>
          i.name === OnlineMenuConfig[index].text ||
          OnlineMenuConfig[index].text.indexOf(i.name) > -1
      );

      if (currentMenuIndex === -1) {
        return;
      }

      OnlineMenuConfig[index]["ele"] = onlineMenus[index];
      const time = await handleCheckUnitPage(
        currentMenuIndex,
        OnlineMenuConfig[index],
        page,
        config
      ).catch(async e => {
        await screenshot(page, `error-${e.page}`);
        pushMenuStatus(config.prodAlias, e.page, 1);
        logger.warn(`menu ${e.page} was not found submenu`);
      });

      time &&
        (await handleScreenShot(
          time,
          basicConfig[Number(currentMenuIndex)].key,
          config,
          page
        ));
    }
  } catch (e) {
    logger.warn(`error-unknown, page menus was not found or not shown`);
  }
}
