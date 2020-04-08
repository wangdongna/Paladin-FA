export interface MenuItemObject {
  key: string;
  name: string;
  validClass: string;
  outer?: boolean;
}
export interface MenuConfigObject {
  key: string;
  name: string;
  validClass?: string;
  outer?: boolean;
  children?: Array<MenuItemObject>;
}

export const MENU_NAV_TIMEOUT = 15;

export const contentPageConfig: Array<MenuConfigObject> = [
  {
    key: "home",
    name: "首页概览",
    validClass: ".jazz-home-main .jazz-home-main-chart",
  },
  {
    key: "kpi",
    name: "指标现状",
    validClass: ".jazz-actuality-item .action-bar",
  },

  {
    key: "smartdiagnose",
    name: "智能诊断",
    children: [
      {
        key: "diagnosis",
        name: "诊断结果",
        validClass: ".jazz-diagnose-problem-left-select-time",
      },
    ],
  },
];
