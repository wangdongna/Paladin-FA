
//云能效
const PALADIN_EA_MAINURI = process.env["PALADIN_EA_MAIN_URI"]
const PALADIN_EA_USERNAME = process.env["PALADIN_EA_USERNAME"]
const PALADIN_EA_PASSWORD = process.env["PALADIN_EA_PASSWORD"]

//千里眼
const PALADIN_FA_MAINURI = process.env["PALADIN_FA_MAIN_URI"]
const PALADIN_FA_USERNAME = process.env["PALADIN_FA_USERNAME"]
const PALADIN_FA_PASSWORD = process.env["PALADIN_FA_PASSWORD"]

//机器顾问
const PALADIN_MA_MAINURI = process.env["PALADIN_MA_MAIN_URI"]
const PALADIN_MA_USERNAME = process.env["PALADIN_MA_USERNAME"]
const PALADIN_MA_PASSWORD = process.env["PALADIN_MA_PASSWORD"]

//变频顾问
const PALADIN_DA_MAINURI = process.env["PALADIN_DA_MAIN_URI"]
const PALADIN_DA_USERNAME = process.env["PALADIN_DA_USERNAME"]
const PALADIN_DA_PASSWORD = process.env["PALADIN_DA_PASSWORD"]

//信息顾问
const PALADIN_ITA_MAINURI = process.env["PALADIN_ITA_MAIN_URI"]
const PALADIN_ITA_USERNAME = process.env["PALADIN_ITA_USERNAME"]
const PALADIN_ITA_PASSWORD = process.env["PALADIN_ITA_PASSWORD"]

export interface Config {
  prodName: string
  mainUri: string
  username: string
  password: string
  loginButtonClass: string
  spMgmtClass: string
  userClass: string
}


export const configList: Array<Config> = [
  {
    prodName: "云能效",
    mainUri: PALADIN_EA_MAINURI,
    username: PALADIN_EA_USERNAME,
    password: PALADIN_EA_PASSWORD,
    loginButtonClass: ".login-button",
    spMgmtClass: ".jazz-select-customer-sp-manage",
    userClass: ".jazz-mainmenu-user>a"
  },
  {
    prodName: "千里眼",
    mainUri: PALADIN_FA_MAINURI,
    username: PALADIN_FA_USERNAME,
    password: PALADIN_FA_PASSWORD,
    loginButtonClass: ".login",
    spMgmtClass: ".pop-select-sp-manage",
    userClass: ".pop-mainmenu-user>button"
  },
  {
    prodName: "机器顾问",
    mainUri: PALADIN_MA_MAINURI,
    username: PALADIN_MA_USERNAME,
    password: PALADIN_MA_PASSWORD,
    loginButtonClass: ".login",
    spMgmtClass: ".pop-select-sp-manage",
    userClass: ".pop-mainmenu-user>button"
  },
  {
    prodName: "变频顾问",
    mainUri: PALADIN_DA_MAINURI,
    username: PALADIN_DA_USERNAME,
    password: PALADIN_DA_PASSWORD,
    loginButtonClass: ".login",
    spMgmtClass: ".pop-select-sp-manage",
    userClass: ".pop-mainmenu-user>button"
  },
  {
    prodName: "信息顾问",
    mainUri: PALADIN_ITA_MAINURI,
    username: PALADIN_ITA_USERNAME,
    password: PALADIN_ITA_PASSWORD,
    loginButtonClass: ".login",
    spMgmtClass: ".pop-select-sp-manage",
    userClass: ".pop-mainmenu-user>button"
  }
]
