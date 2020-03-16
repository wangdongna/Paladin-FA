import * as config from "../prodConfig";
import * as puppeteer from "puppeteer";
import { getLogger } from "log4js";
import { screenshot, isLocatorReady } from "../util";
import Customer from "./customer";
import MenuBar from "./menuBar";
const logger = getLogger("eaModule");
const currentProd = process.env["PROD_NAME"];

const NAV_TIMEOUT = parseInt(process.env["NAV_TIMEOUT"] || "15");

export async function main(config: config.Config, page: puppeteer.Page) {
  logger.info("Into EA-Main");
  await Customer(config, page);
  await MenuBar(config, page);
  logger.info("leave EA-Main");
}
