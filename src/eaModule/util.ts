import * as config from "../prodConfig";
import * as puppeteer from "puppeteer";
import { pushDuration } from "../pushGateway";
import { screenshot } from "../util";
import { getLogger } from "log4js";
import { MENU_NAV_TIMEOUT } from "./config";

const PROD_NAME = process.env["PROD_NAME"];

export const getProdAlias = (): config.Config => {
  return config.configList.find(
    value => value.prodAlias.toLowerCase() === PROD_NAME
  );
};

export const handleScreenShot = async (
  startTime: Date,
  endTime: Date,
  screenname: string,
  config: config.Config,
  page: puppeteer.Page
) => {
  const logger = getLogger("handleScreenShot");
  const duration = (Number(endTime) - Number(startTime)) / 1000;

  pushDuration(config.prodAlias, duration, screenname);

  // 处理是否超时的逻辑
  if (Math.round(duration) < Number(MENU_NAV_TIMEOUT)) {
    await screenshot(page, `${screenname}-success`);
    logger.info(`menu ${screenname} check success`);
  } else {
    await screenshot(page, `error-${screenname}`);
    logger.info(`menu ${screenname} check outtime`);
  }
};
