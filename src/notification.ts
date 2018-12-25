import * as request from "request"

let metalHost = process.env["PALADIN_METAL_HOST"];
let alertEmail = process.env["PALADIN_ALERT_EMAIL"];
let alertPhone = process.env["PALADIN_ALERT_PHONE"];
let prodInfo = process.env["PALADIN_PROD_INFO"];
let alertCounter = process.env["PALADIN_ALERT_COUNTER"];

if(!metalHost || !alertEmail || !alertPhone) {
  console.error("PALADIN_METAL_HOST or PALADIN_ALERT_EMAIL or PALADIN_ALERT_PHONE is empty");
  process.exit(1)
}

let emails = alertEmail.split(",");
let phones = alertPhone.split(",");
let counter = parseInt(alertCounter);

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
  }, (error, response, body) => {
    if(error) {
      console.error(error);
    }
    console.log(body)
  })
}

function sendSMS(){
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
        "Payload": `{\"time\": \"${new Date().toISOString()}\"}` , //消息负载，下面有详细描述
        "To": phones, //发送目标地址，可以为手机号或者Email地址，可以多个
        "IsUsedAliSMS": true, //是否使用阿里云的短信消息通道，目前除了HipHop项目，都已经使用了阿里云的短信通道，如果此字段为false，则使用老旧的空投网作为短信通道，发邮件时此字段非必需
        "Title": "施耐德电气", //消息标题，下面有详细描述
        "TemplateNo": "SMS_152507241" //短信模板，发邮件时此字段非必需
    })
  }, (error, response, body) => {
    if(error) {
      console.error(error);
    }
    console.log(body)
  })
}

function decCounter() {
  counter--;
  if(counter < 5) {
    sendEmail(`Counter`, "counter is less than 5, need restart container")
  }
}

export default {
  sendEmail(error: string) {
    if(counter > 5){
      sendEmail(`${prodInfo}登录异常`, error)
    }
    decCounter()
  },
  sendSMS() {
    if(counter > 5){
      sendSMS()
    }
    
  }
}