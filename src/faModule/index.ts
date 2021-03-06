import * as config from "../prodConfig";
import * as puppeteer from "puppeteer";
import { getLogger } from "log4js";
import { screenshot, isLocatorReady } from "../util";
import { pushDuration } from "../pushGateway";
import faConfig from "./config";
import manualDispatch from "./manualDispatch";
import maintainplan from "./maintainplan";
import ticket from "./ticket";
import diagnose from "./diagnose";
import dataeye from "./dataeye";

const timeoutOption = { timeout: 10000 };
//import Customer from "./customer";
//import contentPage from "./contentPage";
//import { sysMgmtBtnClass } from "./config";
//import sysMgmtPage from "./systemManagementPage";
const logger = getLogger("faModule");

const switchToSysMgmtPage = async (page: puppeteer.Page) => {
  logger.info("switch to System Management Page");
  //var sysMgmtBtn = await page.$(sysMgmtBtnClass);
  //await Promise.all([page.waitForNavigation(), sysMgmtBtn.click()]);
};

export default async (config: config.Config, page: puppeteer.Page) => {
  logger.info("Into FA");

  await manualDispatch(config, page);

  // await maintainplan(config, page);

  // await ticket(config, page);

  // await diagnose(config, page);

  // await dataeye(config, page);

  logger.info("leave FA");
};
