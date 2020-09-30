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

  let addPlanButtonItem = await page.waitForSelector(
    addPlanButtonSelector,
    timeOutOption
  );

  if (addPlanButtonItem) {
    logger.info("maintain plan shown");
    await screenshot(page, "maintain plan");
    endTime = new Date();
    duration = (endTime - startTime) / 1000;
    pushDuration(config.prodAlias, duration, "maintainplan_success");
  } else {
    logger.info("maintain plan not shown, url is: %s", page.url());
    throw new Error("unknow error");
  }

  let dropdown = await page.$$("div.ant-select-selection__rendered");

  await page.click(addPlanButtonSelector);
  await page.waitFor(500);
  await page.click(inspectionItemSelector);
  await page.waitFor(2000);
  await page.type(planNameInputSelector, "望京施耐德培训计划");
  await page.click(assetScopeSelector);
  await page.click(assetNodeSelector);
  await page.click(SelectDateSelector);
  await page.click(TimeTodaySelector);
  await page.waitFor(1000);
  await page.click(TimeTodaySelector);
  await page.waitFor(1000);
  await page.click(DropdownButtonSelector);
  await page.waitFor(1000);
  await page.click(StepDropdownListSelector);
  await page.waitFor(2000);
  await dropdown[2].click();
  logger.info("3 --------------- 3");
  await page.waitFor(120000);
}

export default async (config: config.Config, page: puppeteer.Page) => {
  logger.info("Into maintainplan");
  await createAndDeleteOtherPlan(config, page);
  logger.info("next");
};
