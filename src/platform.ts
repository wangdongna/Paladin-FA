import { getLogger } from "log4js";
import * as puppeteer from "puppeteer"
import { screenshot } from "./util";

const logger = getLogger("platform")

export enum EmopEntry {
  Gateway,
  Template,
  Tag
}

interface CheckModel {
  name: string
  screenshotName: string
  tabSelector: string
  checkpointSelector: string
}

const platformCheckList: CheckModel[] = [
  {
    name: "gateway",
    screenshotName: "emop-gateway",
    tabSelector: "/gateway",
    checkpointSelector: "div.gatewayBar"
  },
  {
    name: "template",
    screenshotName: "emop-template",
    tabSelector: "/template",
    checkpointSelector: "div.screen_class"
  },
  {
    name: "tag",
    screenshotName: "emop-tag",
    tabSelector: "/tag",
    checkpointSelector: "div.physic-tag-table"
  },
  {
    name: "version",
    screenshotName: "emop-version",
    tabSelector: "/version",
    checkpointSelector: "div.Version_list_wrap"
  },
  {
    name: "access",
    screenshotName: "emop-access",
    tabSelector: "/access",
    checkpointSelector: "div.gateway-wrap"
  },
]

const entryMap: { [key: string]: EmopEntry } = {
  "gateway": EmopEntry.Gateway,
  "tag": EmopEntry.Tag,
  "template": EmopEntry.Template
}

function getEntryCheckModel(entry: EmopEntry) {
  return platformCheckList.find(model => entryMap[model.name] === entry)
}

function getRestOfCheckList(entry: EmopEntry) {
  return platformCheckList.filter((model) => entryMap[model.name] !== entry)
}


export default async (page: puppeteer.Page, entry: EmopEntry) => {
  //await newPage.waitForSelector("div.gateway")
  let entryModel = getEntryCheckModel(entry)
  try {
    await page.waitForSelector(entryModel.checkpointSelector)
    logger.info("enter %s main page", entryModel.name)
    await screenshot(page, `emop-entry-${entryModel.name}`)
  }
  catch (exc) {
    logger.error("enter emop %s, error", entryModel.name)
    await screenshot(page, `error-entry-${entryModel.screenshotName}`)

    return
  }


  let restOfCheckList = getRestOfCheckList(entry)

  for (let model of restOfCheckList) {
    try {
      let tab = await page.$(`a[href='${model.tabSelector}'`)
      await tab.click()
      await page.waitForSelector(model.checkpointSelector)
      await screenshot(page, model.screenshotName)
    }
    catch (exc) {
      logger.error("emop check %s, error", model.name)
      await screenshot(page, `error-${model.screenshotName}`)
      return
    }

  }

}
