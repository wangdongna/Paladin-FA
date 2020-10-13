import * as config from "../prodConfig";
import * as puppeteer from "puppeteer";
import { getLogger } from "log4js";
import { screenshot } from "../util";
import { pushDuration } from "../pushGateway";
//import { handleScreenShot } from "./util";

const logger = getLogger("faModule-maintainplan");
const currentProd = process.env["PROD_NAME"];

const planHoverSelector: string = "ul.ant-menu.menu-content>:nth-child(6)";
const planSelector: string = "ul[id*=maintenance]>:nth-child(2)";
const addPlanButtonSelector: string =
  "button.ant-btn.ant-dropdown-trigger.ant-btn-primary";
const inspectionItemSelector: string =
  "ul.ant-dropdown-menu-item-group-list>:nth-child(2)";
const planNameInputSelector: string =
  "#maintenance-edit-content-form_plan-name";
const assetScopeSelector: string = "span.ant-select-search__field__placeholder";
const assetNodeSelector: string = "div.tree-node-content";

const SelectDateSelector: string = "span.ant-calendar-picker-input.ant-input";
const TimeTodaySelector: string = "td.ant-calendar-cell.ant-calendar-today";
const DropdownButtonSelector: string = "div.ant-select-selection__placeholder";
const StepDropdownListSelector: string = "li.ant-select-dropdown-menu-item";
const commentSelector: string =
  "#maintenance-edit-content-form_plan-description";
const saveButtonSelector: string = "button.ant-btn.ant-btn-primary";
const editButtonSelector: string =
  "span.ant-page-header-heading-extra>button.ant-btn.ant-btn-primary";
const deleteButtonSelector: string =
  "span.ant-page-header-heading-extra>button";
const deleteConfirmButtonSelector: string =
  "div.ant-modal-confirm-btns>button.ant-btn.ant-btn-primary";

const NAV_TIMEOUT = parseInt(process.env["NAV_TIMEOUT"] || "15");
const timeOutOption: Object = {
  visible: true,
  timeout: NAV_TIMEOUT * 1000
};

async function createAndDeleteOtherPlan(
  config: config.Config,
  page: puppeteer.Page
) {
  let startTime: any = new Date();
  let endTime: any = new Date();
  let duration: number = 0;

  await page.waitFor(2000);
  await page.hover(planHoverSelector);
  await page.waitFor(1000);
  await page.click(planSelector);
  await page.waitFor(1000);
  await page.waitForSelector(addPlanButtonSelector, timeOutOption);

  await page.click(addPlanButtonSelector);
  await page.waitFor(500);
  await page.click(inspectionItemSelector);
  await page.waitFor(2000);
  await page.type(planNameInputSelector, "望京施耐德培训计划");
  await page.waitFor(1000);
  await page.click(assetScopeSelector);
  await page.waitFor(1000);
  await page.click(assetNodeSelector);
  await page.waitFor(1000);
  await page.click("div.pop-newplan-content");
  await page.waitFor(1000);
  await page.click(SelectDateSelector);
  await page.waitFor(1000);
  await page.click(TimeTodaySelector);
  await page.waitFor(1000);
  await page.click(TimeTodaySelector);
  await page.waitFor(1000);
  await page.click(DropdownButtonSelector);
  await page.waitFor(1000);
  await page.click(StepDropdownListSelector);
  await page.waitFor(2000);
  const dropdown = await page.$$("div.ant-select-selection__rendered");
  await dropdown[3].click();
  await page.waitFor(1000);
  const dropdownitem = await page.$("li[label='AutoCustomer']");
  await dropdownitem.click();
  await page.waitFor(1000);
  await page.type(commentSelector, "望京施耐德培训计划备注");
  await page.waitFor(1000);
  await page.click(saveButtonSelector);
  await page.waitFor(2000);

  let editPlanButtonItem = await page.waitForSelector(
    editButtonSelector,
    timeOutOption
  );

  if (editPlanButtonItem) {
    logger.info("maintain plan added show");
    await screenshot(page, "maintain plan show");
    endTime = new Date();
    duration = (endTime - startTime) / 1000;
    pushDuration(config.prodAlias, duration, "maintainplanadd_success");
  } else {
    logger.info("maintain plan not add, url is: %s", page.url());
    throw new Error("unknow error");
  }

  //edit this maintain plan
  await page.click(editButtonSelector);
  await page.waitFor(1000);
  await page.click(saveButtonSelector);
  await page.waitFor(2000);

  let deletePlanButtonItem = await page.waitForSelector(
    deleteButtonSelector,
    timeOutOption
  );

  if (deletePlanButtonItem) {
    logger.info("maintain plan edit show");
    await screenshot(page, "maintain plan edit");
    endTime = new Date();
    duration = (endTime - startTime) / 1000;
    pushDuration(config.prodAlias, duration, "maintainplanaedit_success");
  } else {
    logger.info("maintain plan not edit, url is: %s", page.url());
    throw new Error("unknow error");
  }

  //delete maintain plan
  await page.click(deleteButtonSelector);
  await page.waitFor(1000);
  await page.click(deleteConfirmButtonSelector);
  await page.waitFor(2000);

  let addPlanButtonItem = await page.waitForSelector(
    "div.ant-empty-image",
    timeOutOption
  );

  if (addPlanButtonItem) {
    logger.info("maintain plan mainpage show");
    await screenshot(page, "maintain plan delete");
    endTime = new Date();
    duration = (endTime - startTime) / 1000;
    pushDuration(config.prodAlias, duration, "maintainplandelete_success");
  } else {
    logger.info("maintain plan not delete, url is: %s", page.url());
    throw new Error("unknow error");
  }
}

export default async (config: config.Config, page: puppeteer.Page) => {
  logger.info("Into maintainplan");
  await createAndDeleteOtherPlan(config, page);
  logger.info("next");
};
