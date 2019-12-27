import * as config from "../prodConfig"
import * as puppeteer from "puppeteer"
import { getLogger } from "log4js"
import { screenshot } from '../util';
import { pushDuration, pushStatus } from "../pushGateway";

const logger = getLogger("daModule")

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
};
export interface PlainObject <T = any> { [key: string]: T; };

let OnlineMenuConfig: PlainObject = [];
const MenuContainerSelector = '.pop-menu > *';
const NAV_TIMEOUT = parseInt(process.env["NAV_TIMEOUT"] || "15");
const TimeOutOption: PlainObject = {
  waitUntil: ["domcontentloaded"]
};
const PALADIN_EMOP_MAINURI = process.env["PALADIN_EMOP_MAIN_URI"];

const basicConfig: Array<MenuItemConfig> = [
  {
    key: 'assets',
    name: '我的设备',
    checkpointSelector: '.pop-asset'
  },
  {
    key: 'alarm',
    name: '故障报警',
    checkpointSelector: '.pop-alarm'
  },
  {
    key: 'maintenance',
    name: '维护计划',
    checkpointSelector: '.maintenance'
  },
  {
    key: 'ticket',
    name: '工单管理',
    checkpointSelector: '.ticket-list'
  },
  {
    key: 'doc',
    name: '文档管理',
    checkpointSelector: '.pop-doc'
  },
  {
    key: 'report',
    name: '报告管理',
    checkpointSelector: '.pop-report'
  },
  {
    key: 'gateway',
    name: '网关管理',
    children: [
      {
        key: 'comxbox',
        name: 'ComX BOX',
        checkpointSelector: '.new-gateway',
        url: '/zh-cn/%customerCode%/gateway/comx/'
      },
      {
        key: 'iot',
        name: 'IoT',
        checkpointSelector: '.gateway',
        url: 'https://%EMOPHost%/doorbell?path=/gateway/%customerID%&sysId=32&spDomain=%spDomain%&userId=%userID%'
      },
    ]
  }
]

const handleCheckUnitPage = async (index: string, menu: PlainObject, page: puppeteer.Page, config: config.Config): Promise<any> => {
  let time: PlainObject = {};

  const gotoSubMenuPage = async (params: PlainObject): Promise<void> => {

    const { customerID, userID, customerCode, spDomain, emopHost, subMenu } = params;

    try {
      if (subMenu.url) {
        time.before = new Date();

        subMenu.url = /^\/zh-cn/.test(subMenu.url) ? `${config.mainUri}${subMenu.url}` : subMenu.url;
        const path = subMenu.url
                      .replace('%EMOPHost%', emopHost)
                      .replace('%spDomain%', spDomain)
                      .replace('%customerCode%', customerCode)
                      .replace('%customerID%', customerID)
                      .replace('%userID%', userID);
  
        await page.goto(`${path}`);
  
        await page.waitForSelector(
          subMenu.checkpointSelector, 
          TimeOutOption
        );
  
        time.after = new Date();

        await handleScreenShot(time, subMenu.key, config, page);
      }
    } catch (error) {
      // 捕获二级菜单错误
      return Promise.reject(subMenu)
    }
    
  }
  
  try {
    const path = menu.href;
    
    // 有网址的跳转
    if (path) {
      const newPath = /^\/zh-cn.*\/$/.test(path)
                   ? `${config.mainUri}${path}` : path;

      time.before = new Date();
      await page.goto(newPath);
      await page.waitForSelector(basicConfig[Number(index)].checkpointSelector, TimeOutOption);
      
      time.after = new Date();

      return time;

    }
    // 有二级菜单
    const currentMenu = basicConfig[Number(index)];
    if ( currentMenu && currentMenu.children) {
      const emopHost = PALADIN_EMOP_MAINURI.split('/')[2];
      const spDomain = config.mainUri.replace("https://","").split('.')[0];
      const Cookies = await page.cookies(config.mainUri);
      const customerID = await Cookies.find(c => c.name === 'CUSTOMERID').value;
      const userID = await Cookies.find(c => c.name === 'UserId').value;
      const customerCode = Number(customerID).toString(16);

      for (let idx in currentMenu.children) {
        await gotoSubMenuPage({
          subMenu: currentMenu.children[idx],
          customerID,
          userID,
          customerCode,
          spDomain,
          emopHost
        }).catch(e => { logger.warn(`menu ${e.name} element[${e.checkpointSelector}] or url[${e.url}] was not found or not shown`) })
      }
      
    }
  } catch (error) {
    // 捕获一级菜单的错误
    const ele = basicConfig[Number(index)];
    return Promise.reject({
      page: ele.key,
      element: ele.checkpointSelector
    })
  }
  
}

const handleScreenShot = async (t: PlainObject, screenname: string, config: config.Config, page: puppeteer.Page) => {
        
  const duration = (t.after - t.before) / 1000;

  pushDuration(config.prodAlias, duration, screenname);
  
  // 处理是否超时的逻辑
  if (duration < NAV_TIMEOUT) {
    await screenshot(page, `${screenname}-success`)
    logger.info(`menu ${screenname} check success`)
  } else {
    await screenshot(page, `error-${screenname}`)
    logger.info(`menu ${screenname} check outtime`)
  }
}

export async function main(config: config.Config, page: puppeteer.Page) {
  logger.info('Into DA-Main')

  // 查找出所有线上的一级菜单名
  OnlineMenuConfig = await page.$$eval(MenuContainerSelector, menus => {
    return [...menus].map((item, index) => {
      return {
        href: item.getAttribute('href'),
        text: item.textContent
      }
    });
  });

  try {
    for (let index in OnlineMenuConfig) {

      // 以配置文件优先
      if (basicConfig.every(c => c.name !== OnlineMenuConfig[index].text)) {
        return;
      }
      
      const time = await handleCheckUnitPage(index, OnlineMenuConfig[index], page, config).catch(e => {
        logger.warn(`menu ${e.page} element[${e.element}] was not found or not shown`)
      });

      time && await handleScreenShot(time, basicConfig[Number(index)].key, config, page);

    }
  } catch (e) {}
}
