//云能效
const PALADIN_EA_MAINURI = process.env["PALADIN_EA_MAIN_URI"];
const PALADIN_EA_USERNAME = process.env["PALADIN_EA_USERNAME"];
const PALADIN_EA_PASSWORD = process.env["PALADIN_EA_PASSWORD"];

//千里眼
const PALADIN_FA_MAINURI = process.env["PALADIN_FA_MAIN_URI"];
const PALADIN_FA_USERNAME = process.env["PALADIN_FA_USERNAME"];
const PALADIN_FA_PASSWORD = process.env["PALADIN_FA_PASSWORD"];

//机器顾问
const PALADIN_MA_MAINURI = process.env["PALADIN_MA_MAIN_URI"];
const PALADIN_MA_USERNAME = process.env["PALADIN_MA_USERNAME"];
const PALADIN_MA_PASSWORD = process.env["PALADIN_MA_PASSWORD"];

//变频顾问
const PALADIN_DA_MAINURI = process.env["PALADIN_DA_MAIN_URI"];
const PALADIN_DA_USERNAME = process.env["PALADIN_DA_USERNAME"];
const PALADIN_DA_PASSWORD = process.env["PALADIN_DA_PASSWORD"];

//信息顾问
const PALADIN_ITA_MAINURI = process.env["PALADIN_ITA_MAIN_URI"];
const PALADIN_ITA_USERNAME = process.env["PALADIN_ITA_USERNAME"];
const PALADIN_ITA_PASSWORD = process.env["PALADIN_ITA_PASSWORD"];

//DataEye
const PALADIN_DE_MAINURI = process.env["PALADIN_DE_MAIN_URI"];
const PALADIN_DE_USERNAME = process.env["PALADIN_DE_USERNAME"];
const PALADIN_DE_PASSWORD = process.env["PALADIN_DE_PASSWORD"];

//EMOP
const PALADIN_EMOP_MAINURI = process.env["PALADIN_EMOP_MAIN_URI"];
const PALADIN_EMOP_USERNAME = process.env["PALADIN_EMOP_USERNAME"];
const PALADIN_EMOP_PASSWORD = process.env["PALADIN_EMOP_PASSWORD"];

export interface Config {
  prodName: string;
  prodAlias: string;
  codeName: string;
  mainUri: string;
  username: string;
  password: string;
  loginButtonClass: string;
  spMgmtClass: string;
  customerClass: string;
  customerTextClass: string;
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
    spMgmtClass: "header.select-customer-header span.title",
    customerClass: "ul li.select-customer-item",
    customerTextClass: "div.select-customer-item-info-title-font"
  },
  {
    prodName: "千里眼",
    codeName: "pop",
    prodAlias: "FA",
    mainUri: PALADIN_FA_MAINURI,
    username: PALADIN_FA_USERNAME,
    password: PALADIN_FA_PASSWORD,
    loginButtonClass: ".login",
    spMgmtClass: "header.select-customer-header span.title",
    customerClass: "a.select-customer-item-herf",
    customerTextClass: "div.select-customer-item-title"
  },
  {
    prodName: "机器顾问",
    codeName: "hiphop",
    prodAlias: "MA",
    mainUri: PALADIN_MA_MAINURI,
    username: PALADIN_MA_USERNAME,
    password: PALADIN_MA_PASSWORD,
    loginButtonClass: ".login-btn",
    spMgmtClass: "div.pop-select-customer-header span",
    customerClass: "div.customer-item",
    customerTextClass: "div.customer-title"
  },
  {
    prodName: "变频顾问",
    prodAlias: "DA",
    codeName: "funk",
    mainUri: PALADIN_DA_MAINURI,
    username: PALADIN_DA_USERNAME,
    password: PALADIN_DA_PASSWORD,
    loginButtonClass: ".login",
    spMgmtClass: "div.pop-minSize > span",
    customerClass: "div.pop-select-customer-ct",
    customerTextClass: "span.pop-select-customer-ct-title"
  },
  {
    prodName: "信息顾问",
    prodAlias: "ITA",
    codeName: "electronic",
    mainUri: PALADIN_ITA_MAINURI,
    username: PALADIN_ITA_USERNAME,
    password: PALADIN_ITA_PASSWORD,
    loginButtonClass: ".login",
    spMgmtClass: "header.select-customer-header span.title",
    customerClass: "a.select-customer-item-herf",
    customerTextClass: "div.select-customer-item-title"
  },
  {
    prodName: "EMOP",
    prodAlias: "EMOP",
    codeName: "emop",
    mainUri: PALADIN_EMOP_MAINURI,
    username: PALADIN_EMOP_USERNAME,
    password: PALADIN_EMOP_PASSWORD,
    loginButtonClass: ".login",
    spMgmtClass: "div.gatewayBar",
    customerClass: "",
    customerTextClass: ""
  },
  {
    prodName: "DataEye",
    prodAlias: "DE",
    codeName: "polka",
    mainUri: PALADIN_DE_MAINURI,
    username: PALADIN_DE_USERNAME,
    password: PALADIN_DE_PASSWORD,
    loginButtonClass: ".login",
    spMgmtClass: "header.select-customer-header span.step",
    customerClass: "a.select-customer-item-herf",
    customerTextClass: "div.select-customer-item-title"
  }
];
