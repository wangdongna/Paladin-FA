import * as config from "./prodConfig";
import * as platform from "./platform";
import * as puppeteer from "puppeteer";
import { getLogger } from "log4js";
import { screenshot } from "./util";
import * as faModule from "./faModule";
import * as daModule from "./daModule";
import * as eaModule from "./eaModule";
import * as maModule from "./maModule";
import * as itaModule from "./itaModule";
import * as deModule from "./deModule";

const logger = getLogger("mainFeatures");

const currentProd = process.env["PROD_NAME"];

function getCustomerName() {
  let key = `PALADIN_${currentProd.toUpperCase()}_CUSTOMERNAME`;
  return process.env[key];
}

const prodMap: { [key: string]: any } = {
  fa: faModule.main,
  ea: eaModule.main,
  da: daModule.main,
  ma: maModule.main,
  ita: itaModule.main,
  de: deModule.main,
  emop: platform.main
};
function getCurrentMain() {
  return prodMap[currentProd.toLowerCase()];
}

export default async (config: config.Config, page: puppeteer.Page) => {
  let prod = currentProd.toLowerCase();
  let customerName = getCustomerName();
  if (prod !== "emop" && prod !== "ea") {
    let customerClass = config.customerClass;
    let customerList = await page.$$(customerClass);
    let willSelectedCustomer: puppeteer.ElementHandle = null;
    for (let ele of customerList) {
      let customerName = await ele.$eval(
        config.customerTextClass,
        node => node.innerHTML
      );
      if (customerName === customerName) {
        willSelectedCustomer = ele;
        break;
      }
    }
    if (!willSelectedCustomer) {
      logger.error("no find customer name is %s", customerName);
      return;
    }
    logger.debug("find customer: %s", customerName);
    if (prod !== "de") {
      await Promise.all([
        page.waitForNavigation(),
        willSelectedCustomer.click()
      ]);
    } else {
      willSelectedCustomer.click();
    }

    logger.info("enter offer's main page");
    await screenshot(page, "contentpage");
  }

  let mainFunc = getCurrentMain();

  if (mainFunc) {
    await getCurrentMain()(config, page);
  }
};
