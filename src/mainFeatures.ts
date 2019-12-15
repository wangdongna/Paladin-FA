import * as config from './prodConfig';
import platform, { EmopEntry } from "./platform"
import * as puppeteer from "puppeteer"
import { getLogger } from "log4js";
import { screenshot, isLocatorReady } from './util';
import * as faModule from "./faModule"
import * as daModule from "./daModule"
import * as eaModule from "./eaModule"
import * as maModule from "./maModule"
import * as itaModule from "./itaModule"

const logger = getLogger("mainFeatures")

const currentProd = process.env["PROD_NAME"]
const prodMap: { [key: string]: any } = {
  "fa": faModule.main,
  "ea": eaModule.main,
  "da": daModule.main,
  "ma": maModule.main,
  "ita": itaModule.main,
}
function getCurrentMain() {
  return prodMap[currentProd.toLowerCase()]
}

export default async (config: config.Config, page: puppeteer.Page) => {
  let customerClass = config.customerClass
  let customerList = await page.$$(customerClass)
  let willSelectedCustomer: puppeteer.ElementHandle = null
  for (let ele of customerList) {
    let customerName = await ele.$eval("div.select-customer-item-title", (node) => node.innerHTML)
    if (customerName === config.customerName) {
      willSelectedCustomer = ele
      break
    }
  }
  if (!willSelectedCustomer) {
    logger.error("no find customer name is %s", config.customerName)
    return
  }
  logger.debug("find customer: %s", config.customerName)
  await Promise.all([
    page.waitForNavigation(),
    willSelectedCustomer.click()
  ]);
  logger.info("enter offer's main page")
  screenshot(page, "contentpage")

  await getCurrentMain()(config, page)

}
