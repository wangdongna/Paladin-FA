import { getLogger } from "log4js";
import * as puppeteer from "puppeteer"
import { screenshot } from "./util";
import * as config from "./prodConfig"

const logger = getLogger("platform")

interface CheckModel {
  name: string
  screenshotName: string
  tabSelector: string
  checkpointSelector: string
}

const platformCheckList: CheckModel[] = [
  {
    name: "gateway",
    screenshotName: "emop-gateway",
    tabSelector: "/gateway",
    checkpointSelector: "div.gatewayBar"
  },
  {
    name: "template",
    screenshotName: "emop-template",
    tabSelector: "/template",
    checkpointSelector: "div.screen_class"
  },
  {
    name: "tag",
    screenshotName: "emop-tag",
    tabSelector: "/tag",
    checkpointSelector: "div.physic-tag-table"
  },
  {
    name: "version",
    screenshotName: "emop-version",
    tabSelector: "/version",
    checkpointSelector: "div.Version_list_wrap"
  },
  {
    name: "access",
    screenshotName: "emop-access",
    tabSelector: "/access",
    checkpointSelector: "div.gateway-wrap"
  },
]


function getNonGatewayCheckList() {
  return platformCheckList.filter((model) => model.name !== "gateway")
}

export async function main(config: config.Config, page: puppeteer.Page) {
  let entryModel = platformCheckList[0]
  try {
    await page.waitForSelector(entryModel.checkpointSelector)
    logger.info("enter %s main page", entryModel.name)
    await screenshot(page, `emop-entry-${entryModel.name}`)
  }
  catch (exc) {
    logger.error("enter emop %s, error", entryModel.name)
    await screenshot(page, `error-entry-${entryModel.screenshotName}`)

    return
  }


  let restOfCheckList = getNonGatewayCheckList()

  for (let model of restOfCheckList) {
    try {
      let tab = await page.$(`a[href='${model.tabSelector}'`)
      await tab.click()
      logger.info("click %s page", entryModel.name)
      await page.waitForSelector(model.checkpointSelector)
      logger.info("enter %s page", entryModel.name)
      await screenshot(page, model.screenshotName)
    }
    catch (exc) {
      logger.error("emop check %s, error", model.name)
      await screenshot(page, `error-${model.screenshotName}`)
      return
    }

  }

}
/*
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


  const [popup] = await Promise.all([
    new Promise(resolve => page.on("popup", resolve)),
    await emopGateway.click()
  ]);

  const newPage = <puppeteer.Page>popup


  await platform(newPage, EmopEntry.Gateway)
*/
