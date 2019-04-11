import * as promClient from "prom-client"
import { getLogger } from "log4js";

const pushGatewayHost = process.env["PUSH_GATEWAY_URI"]
const logger = getLogger("pushgateway")

if (!pushGatewayHost) {
  console.error("PUSH_GATEWAY_URI is empty");
  process.exit(1)
}
const gateway = new promClient.Pushgateway(`http://${pushGatewayHost}`);
const timingGauge = new promClient.Gauge({ name: "login_duration_seconds", help: "duration of whole login process" })

export const pushDuration = (prodInfo: string, duration: number, phase: string) => {
  try {
    timingGauge.set(duration)
    logger.info("prod:%s, phase: %s,  duration:%s", prodInfo, phase, duration)
    gateway.pushAdd({ jobName: "paladin", groupings: { prod: prodInfo, phase } }, (err, response, body) => {
      if (err) {
        logger.error("push gateway push error: %j", err)
      }
      else {
        logger.info("push gateway result: %j", response.statusCode)
      }
    })
  }
  catch (e) {
    logger.error("push gateway error: %s", e)
  }
}


export const pushStatus = (prodInfo: string, val: number) => {
  try {
    const livenessGauge = new promClient.Gauge({ name: "login_status", help: "check status of login, 0 is success, 1 is failure" });
    livenessGauge.set(val);
    gateway.pushAdd({ jobName: "paladin", groupings: { prod: prodInfo } }, (err, response, body) => {
      if (err) {
        logger.error("push gateway push error: %j", err)
      }
      else {
        logger.info("push gateway result: %j", response.statusCode)
      }
    })
  }
  catch (e) {
    logger.error("push gateway error: %s", e)
  }
}
