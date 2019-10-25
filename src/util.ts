import { getLogger } from "log4js"
import * as request from "request"
import * as rp from "request-promise"

const logger = getLogger("util")

const TROJAN_HOST = process.env["TROJAN_HOST"]


export function getValidationCode(id: string, callback: (code: string) => Promise<void>) {
  let uri = `${TROJAN_HOST}/validationCode/${id}`
  if (uri.indexOf("http") < 0) {
    uri = "https://" + uri
  }
  logger.info("trojan uri is %s", uri)
  request.get(uri, (error, response, body) => {
    if (error) {
      logger.error('error:', error)
      callback("")
    }
    else {
      logger.info("statusCode: %s, body: %s", response && response.statusCode, body)
      callback(body)
    }
  })
}

export function isMaintaining() {
  let status = process.env["IS_MAINTAINING"]
  if (status === "1") {
    return true
  }

  return false

}
