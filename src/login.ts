import { getLogger } from "log4js";
import * as puppeteer from "puppeteer";
import { screenshot, getValidationCode } from "./util";
import * as config from './prodConfig';
import { pushDuration } from "./pushGateway";


const logger = getLogger("login")

let checkRoleList = ""
let lastAction = ""

const CLICK_TIMEOUT = parseInt(process.env["CLICK_TIMEOUT"] || "5") * 1000;

const navigationOption: puppeteer.NavigationOptions = { waitUntil: ["domcontentloaded"] }
const timeoutOption = { timeout: CLICK_TIMEOUT }

export default async (config: config.Config, page: puppeteer.Page) => {
  logger.info("entering sso page")
  lastAction = "sso"

  let startTime: any = new Date()
  let endTime: any = new Date()
  let duration: number = 0

  const veriCodeRes = await page.waitForResponse(
    response => response.url().indexOf("GetVerificationCode") >= 0 && response.status() === 200 && response.request().method() !== "OPTIONS");
  logger.info("veri code got it")
  endTime = new Date()
  duration = (endTime - startTime) / 1000
  pushDuration(config.prodAlias, duration, "sso_success")

  await screenshot(page, "sso")

  const { Result: { Id } } = <any>await veriCodeRes.json();
  logger.debug(`vericode id is ${Id}`)

  await new Promise((resolve, reject) => {
    getValidationCode(Id, async (val) => {
      try {
        const result = val
        logger.debug("veri code value is", result)

        if (!result) throw new Error("validtion code is empty")

        await page.type("input[placeholder=请输入用户名]", config.username)
        await page.type("input[placeholder=请输入密码]", config.password)
        await page.type("input[placeholder=请输入图中算式结果]", result)

        lastAction = "sso-filled-in"
        await screenshot(page, "sso-filled-in")

        let buttons = await page.$$(".pop-login-form-content-button button")
        checkRoleList = `${config.codeName}-webapi,${config.codeName}-app`;
        lastAction = "login-success"
        startTime = new Date()
        let responses = await Promise.all([
          await buttons[1].click(),
          await page.waitForNavigation(navigationOption),
          await page.waitForNavigation(navigationOption),
          await page.waitForNavigation(navigationOption),
        ])
        logger.info("customer selection shown")
        responses.forEach((item: any) => {
          if (item && item.url) {
            logger.info("uri change to %s", item.url())
          }
        })


        await page.waitForSelector(config.spMgmtClass, timeoutOption)
        // await page.waitFor(10 * 1000); //wait for 10 seconds
        logger.info("login success")
        endTime = new Date()
        duration = (endTime - startTime) / 1000
        pushDuration(config.prodAlias, duration, "login_success")

        await screenshot(page, "login-success")




        resolve()
      }
      catch (error) {
        logger.error(error)
        reject(error)
      }
    })
  })
}
