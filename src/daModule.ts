import * as config from './prodConfig';
import platform, { EmopEntry } from "./platform"
import * as puppeteer from "puppeteer"
import { getLogger } from "log4js";
import { screenshot, isLocatorReady } from './util';

const logger = getLogger("daModule")

export async function main(config: config.Config, page: puppeteer.Page) {
  let tabList = await page.$$("li.ant-menu-submenu.ant-menu-submenu-horizontal")
  logger.debug("tab list number is %d", tabList.length)
  let gatewayMgmtTab = null
  for (let tab of tabList) {
    try {
      let tabName = await tab.$eval("span.main-title", (node) => node.innerHTML)
      if (tabName === "网关管理") {
        gatewayMgmtTab = tab
        break
      }
    }
    catch {
      //do not care
    }

  }
  if (!gatewayMgmtTab) {
    logger.error("no find tab name is 网关管理")
    return
  }
  logger.debug("find 网关管理 tab")
  await gatewayMgmtTab.hover()
  logger.debug("hover 网关管理")
  await page.waitFor("li.ant-menu-item[external=iotP]");
  let emopGateway = await page.$("li.ant-menu-item[external=iotP]")
  logger.debug("wait for iotP")

  // await Promise.all([
  //   page.waitForNavigation(),
  //   await emopGateway.click()
  // ]);

}
