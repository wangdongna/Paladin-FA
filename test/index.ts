import notificaiton from "../src/notification"
import * as OSS from "ali-oss"
import {configure, getLogger } from "log4js";
import logConfig from "../src/logConfig";
import * as moment from "moment"

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

(async () => await notificaiton.syncLastStatus(ossClient))()

logger.debug(moment(moment().toJSON()).unix())
