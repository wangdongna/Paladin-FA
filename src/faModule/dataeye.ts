import * as config from "../prodConfig";
import * as puppeteer from "puppeteer";
import { getLogger } from "log4js";
import { screenshot } from "../util";
import { pushDuration } from "../pushGateway";
//import { handleScreenShot } from "./util";

const logger = getLogger("faModule-dataeye");
const currentProd = process.env["PROD_NAME"];

const dataeyeSelector: string = "ul.ant-menu.menu-content>:nth-child(16)";
const adddataeyeButtonSelector: string = "div.add-board";
const boardNameSelector: string = "input.ant-input";
const moreButtonSelector: string =
  "button.ant-btn.ant-dropdown-trigger.ant-btn-default";
const configButtonSelector: string = "button.ant-btn.ant-btn-primary";
const saveButtonSelector: string = "span.icon.icon-DY-save";
const backButtonSelector: string = "button.ant-btn";
const deleteConfirmButtonSelector: string =
  "div.ant-modal-footer>button.ant-btn.ant-btn-danger";

const NAV_TIMEOUT = parseInt(process.env["NAV_TIMEOUT"] || "15");
const timeOutOption: Object = {
  visible: true,
  timeout: NAV_TIMEOUT * 1000
};

async function createAndDeletedataeye(
  config: config.Config,
  page: puppeteer.Page
) {
  let startTime: any = new Date();
  let endTime: any = new Date();
  let duration: number = 0;

  await page.waitFor(2000);
  await page.click(dataeyeSelector);
  await page.waitFor(1000);

  await page.waitForSelector(adddataeyeButtonSelector, timeOutOption);

  await page.click(adddataeyeButtonSelector);
  await page.waitFor(2000);
  await page.type(boardNameSelector, "施耐德电气监控普通看板");
  await page.waitFor(1000);
  await page.click(configButtonSelector);
  await page.waitFor(2000);
  await page.click(saveButtonSelector);
  await page.waitFor(2000);
  await page.click(backButtonSelector);
  await page.waitFor(2000);

  let moreButtonItem = await page.waitForSelector(
    moreButtonSelector,
    timeOutOption
  );

  if (moreButtonItem) {
    logger.info("dataeye added show");
    await screenshot(page, "dataeye show");
    endTime = new Date();
    duration = (endTime - startTime) / 1000;
    pushDuration(config.prodAlias, duration, "dataeye_add_success");
  } else {
    logger.info("dataeye not add, url is: %s", page.url());
    throw new Error("unknow error");
  }

  //edit this dataeye
  await page.click(moreButtonSelector);
  await page.waitFor(1000);
  const edititem = await page.$("span.icon.icon-DY-edit");
  await edititem.click();
  await page.waitFor(2000);
  await page.click(saveButtonSelector);
  await page.waitFor(3000);
  await page.click(backButtonSelector);
  await page.waitFor(2000);

  moreButtonItem = await page.waitForSelector(
    moreButtonSelector,
    timeOutOption
  );

  if (moreButtonItem) {
    logger.info("dataeye added show");
    await screenshot(page, "dataeye show");
    endTime = new Date();
    duration = (endTime - startTime) / 1000;
    pushDuration(config.prodAlias, duration, "dataeye_add_success");
  } else {
    logger.info("dataeye not add, url is: %s", page.url());
    throw new Error("unknow error");
  }

  //delete this dataeye
  await page.click(moreButtonSelector);
  await page.waitFor(1000);
  const deleteitem = await page.$("span.icon.icon-DY-delete");
  await deleteitem.click();
  await page.waitFor(2000);
  await page.click(deleteConfirmButtonSelector);
  await page.waitFor(3000);

  let adddataeyeButtonItem = await page.waitForSelector(
    adddataeyeButtonSelector,
    timeOutOption
  );

  if (adddataeyeButtonItem) {
    logger.info("dataeye mainpage show");
    await screenshot(page, "dataeye delete");
    endTime = new Date();
    duration = (endTime - startTime) / 1000;
    pushDuration(config.prodAlias, duration, "dataeye_delete_success");
  } else {
    logger.info("dataeye not delete, url is: %s", page.url());
    throw new Error("unknow error");
  }
}

export default async (config: config.Config, page: puppeteer.Page) => {
  logger.info("Into dataeye");
  await createAndDeletedataeye(config, page);
  logger.info("next");
};
