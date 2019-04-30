import notification from "../src/notification"
import * as OSS from "ali-oss"
import { configure, getLogger } from "log4js";
import logConfig from "../src/logConfig";
import * as moment from "moment"
import { pushDuration, pushStatus } from "../src/pushGateway"

const LOG_LEVEL = "DEBUG"

configure(logConfig(LOG_LEVEL))

const logger = getLogger("test")

const endpoint = process.env["HARDCORE_OSS_ENDPOINT"]
const accessKeySecret = process.env["COMMON_ALIYUN_ACCESS_SECRET"]
const accessKeyId = process.env["COMMON_ALIYUN_ACCESS_ID"]
const bucket = process.env["OSS_BUCKET_DATA"]

logger.debug("endpoint:%s", endpoint)
logger.debug("accessKeySecret:%s", accessKeySecret)
logger.debug("accessKeyId:%s", accessKeyId)
logger.debug("bucket:%s", bucket)


const ossClient = new OSS({
  endpoint,
  accessKeyId,
  accessKeySecret,
  bucket,
  internal: false
});

// (async () => await notificaiton.syncLastStatus(ossClient))()

let now: any = new Date()
logger.debug("now:%s", now.toJSON())
let lastTime: any = new Date(Date.parse("2019-04-30T05:55:16.137Z"))
logger.debug("last time: %s", lastTime.toJSON())
let nowTime = now

logger.debug((nowTime - lastTime) / 1000)
// logger.debug(moment(moment().toJSON()).unix())

//pushGateway("FA", 0, 5.6)
