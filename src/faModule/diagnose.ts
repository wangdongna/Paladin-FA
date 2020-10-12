import * as config from "../prodConfig";
import * as puppeteer from "puppeteer";
import { getLogger } from "log4js";
import { screenshot } from "../util";
import { pushDuration } from "../pushGateway";
//import { handleScreenShot } from "./util";

const logger = getLogger("faModule-diagnose");
const currentProd = process.env["PROD_NAME"];

const diagnoseHoverSelector: string = "ul.ant-menu.menu-content>:nth-child(12)";
const diagnoseSelector: string = "ul[id*=diagnose-analysis]>:nth-child(1)";
const adddiagnoseButtonSelector: string = "button.ant-btn.ant-btn-primary";
const nextStepButtonSelector: string =
  "div.ant-modal-footer>div>button.ant-btn.ant-btn-primary";
const deviceSelector: string = "span.ant-select-arrow";
const moreButtonSelector: string = "button.ant-btn.ant-dropdown-trigger";
const saveButtonSelector: string = "button.ant-btn.ant-btn-primary";
const deleteConfirmButtonSelector: string =
  "div.ant-modal-confirm-btns>button.ant-btn.ant-btn-primary";

const NAV_TIMEOUT = parseInt(process.env["NAV_TIMEOUT"] || "15");
const timeOutOption: Object = {
  visible: true,
  timeout: NAV_TIMEOUT * 1000
};

async function createAndDeletediagnose(
  config: config.Config,
  page: puppeteer.Page
) {
  let startTime: any = new Date();
  let endTime: any = new Date();
  let duration: number = 0;

  await page.waitFor(2000);
  await page.hover(diagnoseHoverSelector);
  await page.waitFor(1000);
  await page.click(diagnoseSelector);
  await page.waitFor(1000);

  await page.waitForSelector(adddiagnoseButtonSelector, timeOutOption);

  await page.click(adddiagnoseButtonSelector);
  await page.waitFor(2000);
  const dropdown = await page.$$("input.ant-radio-input");
  await dropdown[0].click();
  await page.waitFor(1000);
  await page.click(nextStepButtonSelector);
  await page.waitFor(3000);
  await page.click(deviceSelector);
  await page.waitFor(2000);
  const dropdownitem = await page.$("span[title='诊断设备']");
  await dropdownitem.click();
  await page.waitFor(5000);
  await page.click(saveButtonSelector);
  await page.waitFor(3000);

  let moreButtonItem = await page.waitForSelector(
    moreButtonSelector,
    timeOutOption
  );

  if (moreButtonItem) {
    logger.info("diagnose added show");
    await screenshot(page, "diagnose show");
    endTime = new Date();
    duration = (endTime - startTime) / 1000;
    pushDuration(config.prodAlias, duration, "diagnose_add_success");
  } else {
    logger.info("diagnose not add, url is: %s", page.url());
    throw new Error("unknow error");
  }

  //edit this diagnose
  await page.click(moreButtonSelector);
  await page.waitFor(1000);
  const dropdownedititem = await page.$$("li.ant-dropdown-menu-item");
  await dropdownedititem[1].click();
  await page.waitFor(2000);
  await page.click(saveButtonSelector);
  await page.waitFor(3000);

  moreButtonItem = await page.waitForSelector(
    moreButtonSelector,
    timeOutOption
  );

  if (moreButtonItem) {
    logger.info("diagnose added show");
    await screenshot(page, "diagnose show");
    endTime = new Date();
    duration = (endTime - startTime) / 1000;
    pushDuration(config.prodAlias, duration, "diagnose_add_success");
  } else {
    logger.info("diagnose not add, url is: %s", page.url());
    throw new Error("unknow error");
  }

  //delete this diagnose
  await page.click(moreButtonSelector);
  await page.waitFor(1000);
  const dropdowndeleteitem = await page.$$("li.ant-dropdown-menu-item");
  await dropdowndeleteitem[2].click();
  await page.waitFor(2000);
  await page.click(deleteConfirmButtonSelector);
  await page.waitFor(3000);

  let adddiagnoseButtonItem = await page.waitForSelector(
    adddiagnoseButtonSelector,
    timeOutOption
  );

  if (adddiagnoseButtonItem) {
    logger.info("diagnose mainpage show");
    await screenshot(page, "diagnose delete");
    endTime = new Date();
    duration = (endTime - startTime) / 1000;
    pushDuration(config.prodAlias, duration, "diagnose_delete_success");
  } else {
    logger.info("diagnose not delete, url is: %s", page.url());
    throw new Error("unknow error");
  }
}

export default async (config: config.Config, page: puppeteer.Page) => {
  logger.info("Into diagnose");
  await createAndDeletediagnose(config, page);
  logger.info("next");
};
