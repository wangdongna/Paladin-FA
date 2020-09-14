import * as config from "../prodConfig";
import * as puppeteer from "puppeteer";
import { getLogger } from "log4js";
import { screenshot } from "../util";
import { pushDuration } from "../pushGateway";
//import { handleScreenShot } from "./util";

const logger = getLogger("faModule-dispatch");
const currentProd = process.env["PROD_NAME"];

const dispatchHoverSelector: string = "ul.ant-menu.menu-content>:nth-child(6)";
const dispatchSelector: string = "ul[id*=maintenance]>li";
const searchInputbox: string = "input.ant-select-search__field";
const dispatchButtonSelector: string = "div.spot-popover-buttons";
const executorCheckboxSelector: string = "input.ant-checkbox-input";
const nextStepSelector: string =
  "div.dispatch-panel-drawer-footer>:nth-child(2)";
const drawerSelector: string = "div.ant-drawer-content-wrapper";
const dispatchPopoverSelector: string = "div.popover-info-item";
const dispatchRecordSelector: string = "div.dispatch-log-anchor";
const dispatchRecordDetailSelector: string =
  "div.dipatch-log-accept-ticket-info-detail";
const myassetSelector: string = "div.pop-asset";

const NAV_TIMEOUT = parseInt(process.env["NAV_TIMEOUT"] || "1500");
const timeOutOption: Object = {
  visible: true,
  timeout: NAV_TIMEOUT * 1000
};

async function openDispatch(config: config.Config, page: puppeteer.Page) {
  let startTime: any = new Date();
  let endTime: any = new Date();
  let duration: number = 0;

  let myAsset = await page.waitForSelector(myassetSelector, timeOutOption);

  if (myAsset) {
    logger.info("my asset shown");
    await screenshot(page, "dispatch");
    endTime = new Date();
    duration = (endTime - startTime) / 1000;
    pushDuration(config.prodAlias, duration, "myAsset_success");
  } else {
    logger.info("my asset not shown, url is: %s", page.url());
    throw new Error("unknow error");
  }

  await page.waitFor(5000);
  await page.hover(dispatchHoverSelector);
  await page.waitFor(1000);
  await page.click(dispatchSelector);
  await page.waitFor(15000);

  let dispatchItem = await page.waitForSelector(
    dispatchButtonSelector,
    timeOutOption
  );

  if (dispatchItem) {
    logger.info("dispatch shown");
    await screenshot(page, "dispatch");
    endTime = new Date();
    duration = (endTime - startTime) / 1000;
    pushDuration(config.prodAlias, duration, "dispatch_success");
  } else {
    logger.info("dispatch not shown, url is: %s", page.url());
    throw new Error("unknow error");
  }
}

async function createDispatchTicket(
  config: config.Config,
  page: puppeteer.Page
) {
  let startTime: any = new Date();
  let endTime: any = new Date();
  let duration: number = 0;

  await page.type(searchInputbox, "望京施耐德");
  await page.keyboard.down("Enter");
  await page.waitFor(5000);

  let dispatchButton = await page.waitForSelector(
    dispatchButtonSelector,
    timeOutOption
  );
  if (dispatchButton) {
    logger.info("dispatchButton shown");
    await screenshot(page, "dispatchButton");
    endTime = new Date();
    duration = (endTime - startTime) / 1000;
    pushDuration(config.prodAlias, duration, "dispatchButton_success");
  } else {
    logger.info("dispatch button not shown, url is: %s", page.url());
    throw new Error("unknow error");
  }

  await page.click(dispatchButtonSelector);

  let executorCheckbox = await page.waitForSelector(
    executorCheckboxSelector,
    timeOutOption
  );
  if (executorCheckbox) {
    logger.info("executorCheckbox shown");
    await screenshot(page, "executorCheckbox");
    endTime = new Date();
    duration = (endTime - startTime) / 1000;
    pushDuration(config.prodAlias, duration, "executorCheckbox_success");
  } else {
    logger.info("executor checkbox not shown, url is: %s", page.url());
    throw new Error("unknow error");
  }

  await page.click(executorCheckboxSelector);
  await page.waitFor(1000);
  await page.click(nextStepSelector);
  await page.waitFor(1000);

  let ticketDrawer = await page.waitForSelector(drawerSelector, timeOutOption);
  if (ticketDrawer) {
    logger.info("ticketDrawer shown");
    await screenshot(page, "ticketDrawer");
    endTime = new Date();
    duration = (endTime - startTime) / 1000;
    pushDuration(config.prodAlias, duration, "ticketDrawer_success");
  } else {
    logger.info("ticket drawer not shown, url is: %s", page.url());
    throw new Error("unknow error");
  }

  await page.click(nextStepSelector);
  await page.waitFor(1000);

  let dispatchPopover = await page.waitForSelector(
    dispatchPopoverSelector,
    timeOutOption
  );
  if (dispatchPopover) {
    logger.info("dispatchPopover shown");
    await screenshot(page, "dispatchPopover");
    endTime = new Date();
    duration = (endTime - startTime) / 1000;
    pushDuration(config.prodAlias, duration, "dispatchPopover_success");
  } else {
    logger.info("dispatch Popover not shown, url is: %s", page.url());
    throw new Error("unknow error");
  }
}

async function openDispatchRecord(config: config.Config, page: puppeteer.Page) {
  let startTime: any = new Date();
  let endTime: any = new Date();
  let duration: number = 0;

  await page.click(dispatchRecordSelector);
  await page.waitFor(5000);

  let dispatchRecordDetail = await page.waitForSelector(
    dispatchRecordDetailSelector,
    timeOutOption
  );

  if (dispatchRecordDetail) {
    logger.info("dispatch record detail shown");
    await screenshot(page, "record_detail");
    endTime = new Date();
    duration = (endTime - startTime) / 1000;
    pushDuration(config.prodAlias, duration, "record_detail_success");
  } else {
    logger.info("dispatch record detail not shown, url is: %s", page.url());
    throw new Error("unknow error");
  }
}

export default async (config: config.Config, page: puppeteer.Page) => {
  logger.info("Into FA-Dispatch-Screen");
  await openDispatch(config, page);
  await createDispatchTicket(config, page);
  logger.info("next");
};
