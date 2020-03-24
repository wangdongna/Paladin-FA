import * as config from "../prodConfig";
import * as puppeteer from "puppeteer";
import { getLogger } from "log4js";
import { screenshot } from "../util";
import { handleScreenShot, getProdAlias } from "./util";

const buidingClass: string =
  "ul li div.select-customer-item-hierachylist div.select-customer-item-hierachylist-list div.select-customer-item-hierachylist-list-item";
const buildingTextClass: string =
  ".select-customer-item-hierachylist-list-item-font";
const logger = getLogger("eaModule-customer");
const currentProd = process.env["PROD_NAME"];

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
  var willSelected: puppeteer.ElementHandle = null;
  for (let ele of classList) {
    let textName = await ele.$eval(textClass, (node: any) => {
      return node.innerText;
    });
    if (textName === textName1) {
      willSelected = ele;
      break;
    }
  }
  return willSelected;
}
async function selectCustomer(config: config.Config, page: puppeteer.Page) {
  let currentTime: Date = new Date();
  let customerName1 = getCustomerName();
  let customerClass = config.customerClass;
  let customerList = await page.$$(customerClass);
  let willSelectedCustomer: puppeteer.ElementHandle = null;
  let buildingName1 = getBuidingName();
  let willSelectedBuilding: puppeteer.ElementHandle = null;

  //select customer
  willSelectedCustomer = await setClasses(
    "customer",
    customerName1,
    customerList,
    willSelectedCustomer,
    config.customerTextClass
  );
  if (!willSelectedCustomer) {
    logger.error("find no customer name is %s", customerName1);
    return;
  }
  logger.debug("find customer: %s", customerName1);
  await willSelectedCustomer.hover();

  //select building
  await page
    .waitForSelector(".select-customer-item-hierachylist-list", TimeOutOption)
    .then(async list => {
      let buildingList;
      buildingList = await page.$$(buidingClass);
      logger.debug("waitForSelector success % is", buildingName1);
      willSelectedBuilding = await setClasses(
        "buiding",
        buildingName1,
        buildingList,
        willSelectedBuilding,
        buildingTextClass
      );
      await Promise.all([
        page.waitForNavigation(),
        willSelectedBuilding.click()
      ]);

      await handleScreenShot(
        currentTime,
        new Date(),
        "select_customer&building",
        config,
        page
      );
      currentTime = new Date();
      logger.debug("find buiding: %s", buildingName1);
    })
    .catch(async () => {
      logger.error("find no buiding name is %");
      await screenshot(page, `error-find-building`);
    });
}

export default async (config: config.Config, page: puppeteer.Page) => {
  logger.info("Into EA-Select-Customer");
  await selectCustomer(config, page);
  logger.info("next");
};
