import * as config from "../prodConfig";
import * as puppeteer from "puppeteer";
import { getLogger } from "log4js";
import Customer from "./customer";
import contentPage from "./contentPage";
import { sysMgmtBtnClass } from "./config";
import sysMgmtPage from "./systemManagementPage";
const logger = getLogger("eaModule");

const switchToSysMgmtPage = async (page: puppeteer.Page) => {
  logger.info("switch to System Management Page");
  var sysMgmtBtn = await page.$(sysMgmtBtnClass);
  await Promise.all([page.waitForNavigation(), sysMgmtBtn.click()]);
};

export async function main(config: config.Config, page: puppeteer.Page) {
  logger.info("Into EA-Main");

  await Customer(config, page);

  await contentPage(config, page);

  await switchToSysMgmtPage(page);

  await sysMgmtPage(config, page);

  logger.info("leave EA-Main");
}
