import * as config from "../prodConfig";
import { buildingClassList } from "./config";
import * as puppeteer from "puppeteer";
import { getLogger } from "log4js";
import { screenshot, isLocatorReady } from "../util";

const logger = getLogger("eaModule-menu");
const currentProd = process.env["PROD_NAME"];

const NAV_TIMEOUT = parseInt(process.env["NAV_TIMEOUT"] || "15");

export default async (config: config.Config, page: puppeteer.Page) => {
  logger.info("Into EA-menu");
  logger.info("next");
};
