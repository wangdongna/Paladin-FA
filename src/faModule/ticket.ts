import * as config from "../prodConfig";
import * as puppeteer from "puppeteer";
import { getLogger } from "log4js";
import { screenshot } from "../util";
import { pushDuration } from "../pushGateway";
//import { handleScreenShot } from "./util";

const logger = getLogger("faModule-ticket");
const currentProd = process.env["PROD_NAME"];

const ticketHoverSelector: string = "ul.ant-menu.menu-content>:nth-child(6)";
const ticketSelector: string = "ul[id*=maintenance]>:nth-child(3)";
const addTicketButtonSelector: string = "div.add-ticket-button>button";
const ticketNameInputSelector: string = "#ticket-edit_ticket-name";
const assetScopeSelector: string = "span.ant-select-search__field__placeholder";
const assetNodeSelector: string = "div.tree-node-content";

const SelectDateSelector: string = "span.ant-calendar-picker-input.ant-input";
const TimeTodaySelector: string = "td.ant-calendar-cell.ant-calendar-today";
const commentSelector: string = "#ticket-edit_description";
const saveButtonSelector: string = "button.ant-btn.ant-btn-primary";
const editButtonSelector: string =
  "span.ant-page-header-heading-extra>div>button.ant-btn.ant-btn-primary.ant-btn-background-ghost";
const deleteButtonSelector: string =
  "span.ant-page-header-heading-extra>div>button";
const deleteConfirmButtonSelector: string =
  "div.ant-modal-confirm-btns>button.ant-btn.ant-btn-primary";

const NAV_TIMEOUT = parseInt(process.env["NAV_TIMEOUT"] || "15");
const timeOutOption: Object = {
  visible: true,
  timeout: NAV_TIMEOUT * 1000
};

async function createAndDeleteXCTicket(
  config: config.Config,
  page: puppeteer.Page
) {
  let startTime: any = new Date();
  let endTime: any = new Date();
  let duration: number = 0;

  await page.waitFor(2000);
  await page.hover(ticketHoverSelector);
  await page.waitFor(1000);
  await page.click(ticketSelector);
  await page.waitFor(1000);

  await page.waitForSelector(addTicketButtonSelector, timeOutOption);

  await page.click(addTicketButtonSelector);
  await page.waitFor(2000);
  await page.type(ticketNameInputSelector, "望京施耐德现场工单");
  await page.click(assetScopeSelector);
  await page.click(assetNodeSelector);
  await page.click("div.ticket-header");
  await page.waitFor(1000);
  await page.click(SelectDateSelector);
  await page.click(TimeTodaySelector);
  await page.waitFor(1000);
  await page.click(TimeTodaySelector);
  await page.waitFor(1000);
  const dropdown = await page.$$("div.ant-select-selection__placeholder");
  await dropdown[1].click();
  await page.waitFor(1000);
  const dropdownitem = await page.$("li[label='AutoCustomer']");
  await dropdownitem.click();
  await page.waitFor(1000);
  await page.type(commentSelector, "望京施耐德现场工单备注");
  await page.waitFor(1000);
  await page.click(saveButtonSelector);
  await page.waitFor(3000);

  let editPlanButtonItem = await page.waitForSelector(
    editButtonSelector,
    timeOutOption
  );

  if (editPlanButtonItem) {
    logger.info("ticket added show");
    await screenshot(page, "ticket show");
    endTime = new Date();
    duration = (endTime - startTime) / 1000;
    pushDuration(config.prodAlias, duration, "ticket_add_success");
  } else {
    logger.info("ticket not add, url is: %s", page.url());
    throw new Error("unknow error");
  }

  //edit this ticket
  await page.click(editButtonSelector);
  await page.waitFor(1000);
  await page.click(saveButtonSelector);
  await page.waitFor(2000);

  let deletePlanButtonItem = await page.waitForSelector(
    deleteButtonSelector,
    timeOutOption
  );

  if (deletePlanButtonItem) {
    logger.info("ticket edit show");
    await screenshot(page, "ticket edit");
    endTime = new Date();
    duration = (endTime - startTime) / 1000;
    pushDuration(config.prodAlias, duration, "maintainplanaedit_success");
  } else {
    logger.info("ticket not edit, url is: %s", page.url());
    throw new Error("unknow error");
  }

  //delete this ticket
  await page.click(deleteButtonSelector);
  await page.waitFor(1000);
  await page.click(deleteConfirmButtonSelector);
  await page.waitFor(2000);

  let addTicketButtonItem = await page.waitForSelector(
    addTicketButtonSelector,
    timeOutOption
  );

  if (addTicketButtonItem) {
    logger.info("ticket mainpage show");
    await screenshot(page, "ticket delete");
    endTime = new Date();
    duration = (endTime - startTime) / 1000;
    pushDuration(config.prodAlias, duration, "ticket_delete_success");
  } else {
    logger.info("ticket not delete, url is: %s", page.url());
    throw new Error("unknow error");
  }
}

export default async (config: config.Config, page: puppeteer.Page) => {
  logger.info("Into ticket");
  await createAndDeleteXCTicket(config, page);
  logger.info("next");
};
