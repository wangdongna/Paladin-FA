import * as config from "../prodConfig";
import { contentPageConfig } from "./config";
import * as puppeteer from "puppeteer";
import { getLogger } from "log4js";
import { selectMenu } from "./selectMenu";

const logger = getLogger("contentPage");

export default async (config: config.Config, page: puppeteer.Page) => {
  logger.info("Into EA-contentPage");
  await selectMenu(page, contentPageConfig, logger);
};
