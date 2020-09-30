import { getLogger } from "log4js";
import * as puppeteer from "puppeteer";
import { screenshot, getVerificationCode } from "./util";
import * as config from "./prodConfig";
import { pushDuration } from "./pushGateway";

const logger = getLogger("login");

const CLICK_TIMEOUT = parseInt(process.env["CLICK_TIMEOUT"] || "5") * 3000;

const navigationOption: puppeteer.NavigationOptions = {
  waitUntil: ["domcontentloaded"]
};
const timeoutOption = { timeout: CLICK_TIMEOUT };

export default async (config: config.Config, page: puppeteer.Page) => {
  logger.info("Entering sso page");

  let startTime: any = new Date();
  let endTime: any = new Date();
  let duration: number = 0;

  const veriCodeRes = await page.waitForResponse(
    response =>
      response.url().indexOf("GetVerificationCode") >= 0 &&
      response.status() === 200 &&
      response.request().method() !== "OPTIONS"
  );
  endTime = new Date();
  duration = (endTime - startTime) / 1000;
  pushDuration(config.prodAlias, duration, "sso_success");

  await screenshot(page, "sso");

  const {
    Result: { Id }
  } = <any>await veriCodeRes.json();

  logger.debug(`Vericode id is ${Id}`);

  try {
    const result = await getVerificationCode(Id);

    logger.debug("Verification code value is", result);

    if (!result) throw new Error("validtion code is empty");

    await page.type("input[placeholder=请输入用户名]", config.username);
    await page.type("input[placeholder=请输入密码]", config.password);
    await page.type("input[placeholder=请输入图中算式结果]", result);

    await screenshot(page, "sso-filled-in");

    let buttons = await page.$$(".pop-login-form-content-button button");
    startTime = new Date();
    let responses = await Promise.all([
      await buttons[1].click(),
      await page.waitForNavigation(navigationOption),
      await page.waitForNavigation(navigationOption),
      await page.waitForNavigation(navigationOption)
    ]);

    responses.forEach((item: any) => {
      if (item && item.url) {
        logger.info("uri change to %s", item.url());
      }
    });
    //await page.waitForSelector(config.spMgmtClass, timeoutOption);

    logger.info("login success");

    endTime = new Date();
    duration = (endTime - startTime) / 1000;
    pushDuration(config.prodAlias, duration, "login_success");
    await screenshot(page, "login-success");
  } catch (error) {
    logger.error(error);
  }
};
