import * as config from '../prodConfig';
import * as puppeteer from "puppeteer"
import { getLogger } from "log4js";
import { screenshot, isLocatorReady } from '../util';

const logger = getLogger("faModule")

export async function main(config: config.Config, page: puppeteer.Page) {
  //to do here
}
