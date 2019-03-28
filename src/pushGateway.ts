import * as promClient from "prom-client"
import { getLogger } from "log4js";

const pushGatewayHost = process.env["PUSH_GATEWAY_URI"]
const logger = getLogger("pushgateway")

if (!pushGatewayHost) {
    console.error("PUSH_GATEWAY_URI is empty");
    process.exit(1)
}


export default (prodInfo: string, val: number, duration: number) => {
    try {
        const gateway = new promClient.Pushgateway(`http://${pushGatewayHost}`);
        const livenessGauge = new promClient.Gauge({ name: "login_status", help: "check status of login, 0 is success, 1 is failure" });
        livenessGauge.set(val);
        const timingGauge = new promClient.Gauge({ name: "login_duration_seconds", help: "duration of whole login process" })
        timingGauge.set(duration)
        logger.info("prod:%s, val:%s, duration:%s", prodInfo, val, duration)
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
