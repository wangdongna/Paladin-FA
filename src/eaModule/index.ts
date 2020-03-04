import * as config from "../prodConfig";
import { buildingList } from "./config";
import * as puppeteer from "puppeteer";
import { getLogger } from "log4js";
import { screenshot, isLocatorReady } from "../util";

const logger = getLogger("eaModule");
const currentProd = process.env["PROD_NAME"];
const buidingClass: string =
  "ul li.select-customer-item dev.select-customer-item-hierachylist dev.select-customer-item-hierachylist-list";
const buildingTextClass: string =
  "dev.select-customer-item-hierachylist-list-item-font";
const NAV_TIMEOUT = parseInt(process.env["NAV_TIMEOUT"] || "15");
const TimeOutOption: Object = {
  visible: true,
  timeout: NAV_TIMEOUT * 1000
};
function getCustomerName() {
  let key = `PALADIN_${currentProd.toUpperCase()}_CUSTOMERNAME`;
  return process.env[key];
}

function getBuidingName() {
  let key = `PALADIN_${currentProd.toUpperCase()}_BUILDINGNAME`;
  return process.env[key];
}
async function setClasses(
  variate: string,
  textName1: string,
  classList: Array<any>,
  willSelected: puppeteer.ElementHandle,
  textClass: string
) {
  if (variate === "buiding") {
    logger.info(`${variate} setClasses parameter is`, classList);
  }

  for (let ele of classList) {
    // logger.info(`${variate} ele is`, ele);
    let textName = await ele.$eval(textClass, (node: any) => node.innerHTML);
    if (textName === textName1) {
      willSelected = ele;
      break;
    }
  }
  return willSelected;
}
async function selectCustomer(config: config.Config, page: puppeteer.Page) {
  let prod = currentProd.toLowerCase();
  let customerName1 = getCustomerName();
  let customerClass = config.customerClass;
  let customerList = await page.$$(customerClass);
  let willSelectedCustomer: puppeteer.ElementHandle = null;
  let buildingName1 = getBuidingName();
  let willSelectedBuilding: puppeteer.ElementHandle = null;
  willSelectedCustomer = await setClasses(
    "customer",
    customerName1,
    customerList,
    willSelectedCustomer,
    config.customerTextClass
  );
  if (!willSelectedCustomer) {
    logger.error("no find customer name is %s", customerName1);
    return;
  }
  logger.debug("find customer: %s", customerName1);
  let buildingList;
  await willSelectedCustomer.hover();
  await page
    .waitForSelector(".select-customer-item-hierachylist-list", TimeOutOption)
    .then(async list => {
      buildingList = await page.$$(buildingList.buidingClass);
      logger.debug("waitForSelector succee % is", buildingName1);
      willSelectedBuilding = await setClasses(
        "buiding",
        buildingName1,
        buildingList,
        willSelectedBuilding,
        buildingTextClass
      );
    })
    .catch(() => logger.error("waitForSelector error % is "));

  if (!willSelectedBuilding) {
    logger.error("no find buiding name is %s", buildingName1);
    return;
  }
  logger.debug("find buiding: %s", buildingName1);

  logger.info("enter offer's main page");
  await screenshot(page, "contentpage");
}
export async function main(config: config.Config, page: puppeteer.Page) {
  await selectCustomer(config, page);
  logger.info("Into EA-Main");
}
