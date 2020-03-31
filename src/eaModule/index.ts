import * as config from "../prodConfig";
import * as puppeteer from "puppeteer";
import { getLogger } from "log4js";
import Customer from "./customer";
import contentPage from "./contentPage";

const logger = getLogger("eaModule");



export async function main(config: config.Config, page: puppeteer.Page) {
  logger.info("Into EA-Main");

  await Customer(config, page);

  await contentPage(config, page);

  logger.info("leave EA-Main");
}
