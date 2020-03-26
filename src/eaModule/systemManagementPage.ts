import * as config from "../prodConfig";
import { sysMgmtPageConfig } from "./config";
import * as puppeteer from "puppeteer";
import { getLogger } from "log4js";
import { selectMenu } from "./selectMenu";

const logger = getLogger("sysMgmtPage");

export default async (config: config.Config, page: puppeteer.Page) => {
  logger.info("Into EA-SystemManagementPage");
  await selectMenu(page, sysMgmtPageConfig, logger);
};
