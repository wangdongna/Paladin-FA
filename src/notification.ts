import { Config } from './prodConfig';
import * as request from "request"
import { getLogger } from "log4js";
import * as moment from "moment";
import * as OSS from "ali-oss"
import { ossClient } from "./util"

const metalHost = process.env["PALADIN_METAL_HOST"];
const alertEmail = process.env["PALADIN_ALERT_EMAIL"];
const alertPhone = process.env["PALADIN_ALERT_PHONE"];
const logger = getLogger("notification")


if (!metalHost || !alertEmail || !alertPhone) {
  console.error("PALADIN_METAL_HOST or PALADIN_ALERT_EMAIL or PALADIN_ALERT_PHONE is empty");
  process.exit(1)
}

let emails = alertEmail.split(",");
let phones = alertPhone.split(",");


interface ErrorMap {
  counter: number
  sendCounter: number
  time: string
}

interface Status {
  [key: string]: ErrorMap
}

let status: Status = {

}


function sendEmail(title: string, error: string, delay: number = 0) {
  request({
    uri: metalHost + "/api/message/send",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      "Type": 2, //短信为1，邮件为2
      "Delay": delay, //延时发送的时间，单位为秒
      "Payload": `${error}`, //消息负载，下面有详细描述
      "To": emails, //发送目标地址，可以为手机号或者Email地址，可以多个
      "IsUsedAliSMS": true, //是否使用阿里云的短信消息通道，目前除了HipHop项目，都已经使用了阿里云的短信通道，如果此字段为false，则使用老旧的空投网作为短信通道，发邮件时此字段非必需
      "Title": title, //消息标题，下面有详细描述
      "TemplateNo": "" //短信模板，发邮件时此字段非必需
    })
  }, (err, response, body) => {
    if (err) {
      logger.error(err);
    }
    logger.debug(body)
    logger.info("email sent : %s", error)
  })
}

function sendSMS(prodInfo: string, info: string, delay: number = 0) {
  let time = moment().utcOffset(8).format("YYYY-MM-DD HH:mm:ss")
  request({
    uri: metalHost + "/api/message/send",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      "Type": 1, //短信为1，邮件为2
      "Delay": delay, //延时发送的时间，单位为秒
      "Payload": `{\"prod\":\"${prodInfo}\", \"time\": \"${time}\", \"status\": \"${info}\"}`, //消息负载，下面有详细描述
      "To": phones, //发送目标地址，可以为手机号或者Email地址，可以多个
      "IsUsedAliSMS": true, //是否使用阿里云的短信消息通道，发邮件时此字段非必需
      "Title": "施耐德电气", //消息标题，下面有详细描述
      "TemplateNo": "SMS_157284444" //产品信息:${prod}，状态是:${status}，发生时间:${time}，请知悉
    })
  }, (err, response, body) => {
    if (err) {
      logger.error(err);
    }
    logger.debug(body)
    logger.info("sms sent : %s", prodInfo)
  })
}

function sendToOps(prodInfo: string, error: string) {
  let time = moment().utcOffset(8).format("YYYY-MM-DD HH:mm:ss")
  request({
    uri: metalHost,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      token: "NN4xxKit2vA2s3BXVx8UdHY8meVJobOH",
      prod: prodInfo,
      status: error,
      time: time
    })
  }, (err, response, body) => {
    if (err) {
      logger.error(err);
    }
    logger.debug(body)
    logger.info("sent to ops: %s", prodInfo)
  })
}


function sendNotification(prodInfo: string, error: string) {
  if (metalHost.indexOf("paladin") >= 0) {
    sendToOps(prodInfo, error)
  }
  else {
    sendEmail(`${prodInfo}${error}`, error)
    sendSMS(prodInfo, error)
  }

}


const ERROR_MSG = "登录异常,可能出现问题的角色有："
const RECOVER_MSG = "登录恢复"

function getStatusFile(prodName: string) {
  return `paladin/${prodName}-status.json`
}

export default {
  async syncLastStatus(config: Config) {
    return
    try {
      let result = await ossClient.get(getStatusFile(config.prodName));
      let content = result.content.toString("utf-8")
      logger.debug("syncLastStatus result: %s", content)
      status = JSON.parse(content)
    } catch (error) {
      let code = error.code
      logger.info("syncLastStatus error code: %s", code)
      if (code === "NoSuchKey") {
        await this.pushLastStatus(ossClient, config)
      }
    }

  },
  async pushLastStatus(config: Config) {
    return
    try {
      let content = JSON.stringify(status)
      logger.debug("pushLastStatus content is: %s", content)
      let ret = await ossClient.put(getStatusFile(config.prodName), Buffer.from(content, "utf-8"))
      logger.debug("pushLastStatus result status: %j", ret.res.status)
    } catch (error) {
      logger.error("pushLastStatus error: %s", error)
    }
  },
  error(prodInfo: string, error: string, checkRoleList: string) {
    return
    let now: any = new Date();
    if (!status[prodInfo]) {
      status[prodInfo] = { counter: 1, sendCounter: 0, time: now.toJSON() }
    }
    else {
      let { counter, sendCounter, time } = status[prodInfo];

      counter++;
      if (counter >= 2 && counter <= 3) {
        sendCounter += 1
        sendNotification(prodInfo, ERROR_MSG + checkRoleList)
      }
      else if (counter > 3) {
        let lastTime: any = new Date(Date.parse(time))
        if (((now - lastTime) / 1000) > 60 * 60) {
          sendCounter += 1
          sendNotification(prodInfo, ERROR_MSG + checkRoleList)
        }
      }
      status[prodInfo] = { counter, sendCounter, time: now.toJSON() }
    }
  },
  success(prodInfo: string) {
    return
    if (status[prodInfo] && status[prodInfo].sendCounter > 0) {
      sendNotification(prodInfo, RECOVER_MSG)
    }
    status[prodInfo] = { counter: 0, sendCounter: 0, time: "" }
  }
}
