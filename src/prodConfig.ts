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

//DataEye
const PALADIN_DE_MAINURI = process.env["PALADIN_DE_MAIN_URI"]
const PALADIN_DE_USERNAME = process.env["PALADIN_DE_USERNAME"]
const PALADIN_DE_PASSWORD = process.env["PALADIN_DE_PASSWORD"]



export interface Config {
    prodName: string
    prodAlias: string
    codeName: string
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
        prodAlias: "EA",
        codeName: "jazz",
        mainUri: PALADIN_EA_MAINURI,
        username: PALADIN_EA_USERNAME,
        password: PALADIN_EA_PASSWORD,
        loginButtonClass: ".login-button",
        spMgmtClass: ".jazz-select-customer-sp-manage",
        userClass: ".jazz-mainmenu-user>a"
    },
    {
        prodName: "千里眼",
        codeName: "pop",
        prodAlias: "FA",
        mainUri: PALADIN_FA_MAINURI,
        username: PALADIN_FA_USERNAME,
        password: PALADIN_FA_PASSWORD,
        loginButtonClass: ".login",
        spMgmtClass: ".pop-select-sp-manage",
        userClass: ".pop-mainmenu-user>button"
    },
    {
        prodName: "机器顾问",
        codeName: "hiphop",
        prodAlias: "MA",
        mainUri: PALADIN_MA_MAINURI,
        username: PALADIN_MA_USERNAME,
        password: PALADIN_MA_PASSWORD,
        loginButtonClass: ".login",
        spMgmtClass: ".pop-select-sp-manage",
        userClass: ".pop-mainmenu-user>button"
    },
    {
        prodName: "变频顾问",
        prodAlias: "DA",
        codeName: "funk",
        mainUri: PALADIN_DA_MAINURI,
        username: PALADIN_DA_USERNAME,
        password: PALADIN_DA_PASSWORD,
        loginButtonClass: ".login",
        spMgmtClass: ".pop-select-sp-manage",
        userClass: ".pop-mainmenu-user>button"
    },
    {
        prodName: "信息顾问",
        prodAlias: "ITA",
        codeName: "electronic",
        mainUri: PALADIN_ITA_MAINURI,
        username: PALADIN_ITA_USERNAME,
        password: PALADIN_ITA_PASSWORD,
        loginButtonClass: ".login",
        spMgmtClass: ".pop-select-sp-manage",
        userClass: ".pop-mainmenu-user>button"
    },
    {
        prodName: "DataEye",
        prodAlias: "DE",
        codeName: "polka",
        mainUri: PALADIN_DE_MAINURI,
        username: PALADIN_DE_USERNAME,
        password: PALADIN_DE_PASSWORD,
        loginButtonClass: ".login",
        spMgmtClass: ".select-customer-header",
        userClass: ".pop-mainmenu-user>button"
    }
]
