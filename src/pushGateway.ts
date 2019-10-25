import * as promClient from "prom-client"
import { getLogger } from "log4js";
import { isMaintaining } from "./util";

const logger = getLogger("pushgateway")

const timingGauge = new promClient.Gauge({ name: "login_duration_seconds", help: "duration of whole login process", labelNames: ["prod", "phase"] })

export const pushDuration = (prodInfo: string, duration: number, phase: string) => {
  if (isMaintaining()) return

  timingGauge.set({ prod: prodInfo, phase }, duration)

  logger.info("prod:%s, phase: %s,  duration:%s", prodInfo, phase, duration)
}

const livenessGauge = new promClient.Gauge({ name: "login_status", help: "check status of login, 0 is success, 1 is failure", labelNames: ["prod"] });

export const pushStatus = (prodInfo: string, val: number) => {
  if (isMaintaining()) return

  livenessGauge.set({ prod: prodInfo }, val);
  logger.info("prod:%s,  status:%s", prodInfo, val)
}

export function reset() {
  timingGauge.reset()
  livenessGauge.reset()
}
