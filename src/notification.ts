import * as request from "request"
import { getLogger } from "log4js";
import * as moment from "moment";
import * as OSS from "ali-oss"

let metalHost = process.env["PALADIN_METAL_HOST"];
let alertEmail = process.env["PALADIN_ALERT_EMAIL"];
let alertPhone = process.env["PALADIN_ALERT_PHONE"];

const logger = getLogger("notification")


if(!metalHost || !alertEmail || !alertPhone) {
  console.error("PALADIN_METAL_HOST or PALADIN_ALERT_EMAIL or PALADIN_ALERT_PHONE is empty");
  process.exit(1)
}

let emails = alertEmail.split(",");
let phones = alertPhone.split(",");


interface ErrorMap {
  counter: number
  time: string
}

interface Status {
  notificationCounter: number
  errorMap: {
    [prodName: string]: ErrorMap
  }
}

let status: Status = {
  notificationCounter: 50,
  errorMap: {

  }
}


function sendEmail(title: string, error: string, delay: number){
  request({
    uri: metalHost + "/api/message/send",
    method: "POST",
    headers: {
      "Content-Type":"application/json",
      'Accept': 'application/json',
    },
    body: JSON.stringify({
        "Type": 2, //短信为1，邮件为2
        "Delay": delay, //延时发送的时间，单位为秒
        "Payload": `${error}` , //消息负载，下面有详细描述
        "To": emails, //发送目标地址，可以为手机号或者Email地址，可以多个
        "IsUsedAliSMS": true, //是否使用阿里云的短信消息通道，目前除了HipHop项目，都已经使用了阿里云的短信通道，如果此字段为false，则使用老旧的空投网作为短信通道，发邮件时此字段非必需
        "Title": title, //消息标题，下面有详细描述
        "TemplateNo": "" //短信模板，发邮件时此字段非必需
    })
  }, (err, response, body) => {
    if(err) {
      logger.error(err);
    }
    logger.debug(body)
    logger.info("email sent : %s", error)
  })
}

function sendSMS(prodInfo: string, info: string, delay: number){
  let time = moment().utcOffset(8).format("YYYY-MM-DD HH:mm:ss")
  request({
    uri: metalHost + "/api/message/send",
    method: "POST",
    headers: {
      "Content-Type":"application/json",
      'Accept': 'application/json',
    },
    body: JSON.stringify({
        "Type": 1, //短信为1，邮件为2
        "Delay": delay, //延时发送的时间，单位为秒
        "Payload": `{\"prod\":\"${prodInfo}\", \"time\": \"${time}\", \"status\": \"${info}\"}` , //消息负载，下面有详细描述
        "To": phones, //发送目标地址，可以为手机号或者Email地址，可以多个
        "IsUsedAliSMS": true, //是否使用阿里云的短信消息通道，发邮件时此字段非必需
        "Title": "施耐德电气", //消息标题，下面有详细描述
        "TemplateNo": "SMS_157284444" //产品信息:${prod}，状态是:${status}，发生时间:${time}，请知悉
    })
  }, (err, response, body) => {
    if(err) {
      logger.error(err);
    }
    logger.debug(body)
    logger.info("sms sent : %s", prodInfo)  })
}

function decCounter() {
  status.notificationCounter--;
  if(status.notificationCounter <= 5 && status.notificationCounter > 0) {
    sendEmail(`Paladin 阈值`, "Paladin 阈值 is less than 5, need restart container", 0)
  }
}

function sendNotification(prodInfo: string, error: string, delay: number) {
  if(status.notificationCounter > 5){
    sendEmail(`${prodInfo}${error}`, error, delay)
    sendSMS(prodInfo, error, delay)
  }
  decCounter()
}


const ERROR_MSG = "登录异常"
const RECOVER_MSG = "登录恢复"

const STATUS_FILE = "paladin/paladin-status.json";

export default {
  async syncLastStatus(ossClient: OSS) {
    try {
      let result = await ossClient.get(STATUS_FILE);
      let content = result.content.toString("utf-8")
      logger.debug("syncLastStatus result: %s", content)
      status = JSON.parse(content)
    } catch (error) {
      let code = error.code
      logger.info("syncLastStatus error code: %s", code)
      if(code === "NoSuchKey") {
        await this.pushLastStatus(ossClient)
      }
    }
    
  },
  async pushLastStatus(ossClient: OSS) {
    try {
      let content = JSON.stringify(status)
      logger.debug("pushLastStatus content is: %s", content)
      let ret = await ossClient.put(STATUS_FILE, Buffer.from(content, "utf-8"))
      logger.debug("pushLastStatus result status: %j", ret.res.status)
    } catch (error) {
      logger.error("pushLastStatus error: %s", error)
    }
  },
  error(prodInfo: string, error: string) {
    let now = moment().utcOffset(8);
    if(!status.errorMap[prodInfo]) {
      status.errorMap[prodInfo] = {counter: 1, time: now.toJSON()}
    }
    else {
      let {counter, time} = status.errorMap[prodInfo];
      
      counter++;
      if(counter == 2 || counter == 4){
        sendNotification(prodInfo, ERROR_MSG, 0)
      }
      else if(counter > 4) {
        let lastTime = moment(time).unix()
        let nowTime = now.unix()
        if((nowTime - lastTime) > 60 * 60) {
          sendNotification(prodInfo, ERROR_MSG, 0)
        }
      }
      status.errorMap[prodInfo] = {counter, time: now.toJSON()}
    }

  },
  success(prodInfo: string) {
    if(status.errorMap[prodInfo] && status.errorMap[prodInfo].counter > 0){
      sendNotification(prodInfo, RECOVER_MSG, 0)
    }
    status.errorMap[prodInfo] = {counter: 0, time: ""}
  }
  
}