import * as config from "../prodConfig";
import * as puppeteer from "puppeteer";
import { getLogger } from "log4js";
import { screenshot } from "../util";
import { pushDuration } from "../pushGateway";
import { response } from "express";
//import { handleScreenShot } from "./util";

const logger = getLogger("faModule-dispatch");
const currentProd = process.env["PROD_NAME"];

const dispatchHoverSelector: string = "ul.ant-menu.menu-content>:nth-child(6)";
const dispatchSelector: string = "ul[id*=maintenance]>li";
const searchbox: string = "div.search-spot";
const spotSearchSelector: string =
  "div.ant-select.ant-select-enabled.ant-select-allow-clear";
const searchInputbox: string = "input.ant-select-search__field";
const dispatchButtonSelector: string =
  "div.spot-popover-buttons>button.ant-btn.ant-btn-primary.ant-btn-sm";
const executorCheckboxSelector: string = "input.ant-checkbox-input";
const nextStepSelector: string =
  "div.dispatch-panel-drawer-footer>:nth-child(2)";
const drawerSelector: string = "div.ant-drawer-content-wrapper";
const dispatchPopoverSelector: string = "div.popover-info-item";
const dispatchRecordSelector: string = "div.dispatch-log-anchor";
const dispatchRecordDetailSelector: string =
  "div.dipatch-log-accept-ticket-info-detail";
const myassetSelector: string = "div.pop-asset";
const ticketSelector: string = "ul[id*=maintenance]>:nth-child(3)";
const allTicketSelector: string = "div.go-to-ticket-list";
const ticketItemSelector: string = "tbody.ant-table-tbody>tr";
const deleteTicketButtonSelector: string = "button.ant-btn";
const deleteConfirmButtonSelector: string =
  "div.ant-modal-confirm-btns>:nth-child(2)";

const NAV_TIMEOUT = parseInt(process.env["NAV_TIMEOUT"] || "15");
const timeOutOption: Object = {
  visible: true,
  timeout: NAV_TIMEOUT * 1000
};

async function openDispatch(config: config.Config, page: puppeteer.Page) {
  let startTime: any = new Date();
  let endTime: any = new Date();
  let duration: number = 0;

  await page.waitForSelector(myassetSelector, timeOutOption);
  await page.hover(dispatchHoverSelector);
  await page.waitForSelector(dispatchSelector, timeOutOption);
  await page.click(dispatchSelector);
  await page.waitFor(8000);

  let dispatchItem = await page.waitForSelector(searchbox, timeOutOption);
  logger.info("after get dispatch input");

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

  await page.click(spotSearchSelector);

  await page.type(searchInputbox, "望京施耐德");
  await page.keyboard.down("Enter");

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
  await page.click(nextStepSelector);
  await page.waitForSelector(drawerSelector, timeOutOption);
  await page.on("response", async response => {
    if (
      response.url().endsWith("CreateUrgentRepairTicket") &&
      response.status() === 200
    ) {
      console.log("request url", response.url());
      console.log("request response status", response.status());
      let responseValue = await response.text();
      if (responseValue.includes('"CallingUserStatus":true')) {
        console.log("create urgent ticket success");
      } else {
        console.log("create urgent ticket failed, url is: %s", page.url());
        throw new Error("unknow error");
      }
    }
  });
  await page.click(nextStepSelector);

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

async function deleteUrgentTicket(config: config.Config, page: puppeteer.Page) {
  let startTime: any = new Date();
  let endTime: any = new Date();
  let duration: number = 0;

  await page.hover(dispatchHoverSelector);
  await page.waitForSelector(ticketSelector, timeOutOption);
  await page.click(ticketSelector);
  await page.waitForSelector(allTicketSelector, timeOutOption);
  await page.click(allTicketSelector);
  await page.waitForSelector(ticketItemSelector, timeOutOption);

  await page.click(ticketItemSelector);
  await page.waitForSelector(deleteTicketButtonSelector, timeOutOption);
  await page.click(deleteTicketButtonSelector);
  await page.waitForSelector(deleteConfirmButtonSelector, timeOutOption);
  await page.click(deleteConfirmButtonSelector);
  await page.waitForSelector("div.ant-empty-image", timeOutOption);
}

export default async (config: config.Config, page: puppeteer.Page) => {
  logger.info("Into FA-Dispatch-Screen");
  await openDispatch(config, page);
  await createDispatchTicket(config, page);
  await openDispatchRecord(config, page);
  await deleteUrgentTicket(config, page);
  logger.info("next");
};
