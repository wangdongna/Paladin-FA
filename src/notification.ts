import * as request from "request"
import { getLogger } from "log4js";
import * as moment from "moment";

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
let counter = 50

function sendEmail(title: string, error: string){
  request({
    uri: metalHost + "/api/message/send",
    method: "POST",
    headers: {
      "Content-Type":"application/json",
      'Accept': 'application/json',
    },
    body: JSON.stringify({
        "Type": 2, //短信为1，邮件为2
        "Delay": 0, //延时发送的时间，单位为秒
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

function sendSMS(prodInfo: string){
  request({
    uri: metalHost + "/api/message/send",
    method: "POST",
    headers: {
      "Content-Type":"application/json",
      'Accept': 'application/json',
    },
    body: JSON.stringify({
        "Type": 1, //短信为1，邮件为2
        "Delay": 0, //延时发送的时间，单位为秒
        "Payload": `{\"prod\":\"${prodInfo}\", \"time\": \"${moment().utcOffset(8).format("YYYY-MM-DD HH:mm:ss")}\"}` , //消息负载，下面有详细描述
        "To": phones, //发送目标地址，可以为手机号或者Email地址，可以多个
        "IsUsedAliSMS": true, //是否使用阿里云的短信消息通道，目前除了HipHop项目，都已经使用了阿里云的短信通道，如果此字段为false，则使用老旧的空投网作为短信通道，发邮件时此字段非必需
        "Title": "施耐德电气", //消息标题，下面有详细描述
        "TemplateNo": "SMS_153332885" //短信模板，发邮件时此字段非必需
    })
  }, (err, response, body) => {
    if(err) {
      logger.error(err);
    }
    logger.debug(body)
    logger.info("sms sent : %s", prodInfo)  })
}

function decCounter() {
  counter--;
  if(counter <= 5) {
    sendEmail(`Counter`, "counter is less than 5, need restart container")
  }
}

function sendNotification(prodInfo: string, error: string) {
  if(counter > 5){
    sendEmail(`${prodInfo}登录异常`, error)
    sendSMS(prodInfo)
  }
  decCounter()
}

let errMap: {[key: string]: number} = {}

export default {
  error(prodInfo: string, error: string) {
    let counter = errMap[prodInfo];
    if(counter) {
      counter++;
      if(counter >= 2){
        sendNotification(prodInfo, error)
      }
    }
    else{
      errMap[prodInfo] = 1
    }
  },
  success(prodInfo: string) {
    errMap[prodInfo] = 0
  }
  
}