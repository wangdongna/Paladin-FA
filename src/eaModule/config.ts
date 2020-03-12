export interface buildingClassConfig {
  buidingClass: string;
  buidingTextClass: string;
}
export const buildingClassList: any = {
  buidingClass:
    "ul li div.select-customer-item-hierachylist div.select-customer-item-hierachylist-list div.select-customer-item-hierachylist-list-item",
  buidingTextClass: ".select-customer-item-hierachylist-list-item-font"
};
export interface MenuItemConfig {
  /** 菜单名称 */
  key: string;

  /** 用于匹配是否存在配置内 */
  name: string;

  /** 页面待检查的元素 */
  checkSelector?: string;
  /** 选中页面后加载成功的页面元素 */
  validClass: string;
  /** 子元素节点 */
  children?: MenuItemConfig[];

  /** 指定跳转的url地址 */
  url?: string;
}

export const basicConfig: Array<MenuItemConfig> = [
  {
    key: "home_main",
    name: "首页概览",
    checkSelector: ".active",
    validClass: ".jazz-home-main .jazz-home-main-button"
  },
  {
    key: "kpi",
    name: "指标现状",
    checkSelector: ".active",
    validClass: ".jazz-actuality-item .action-bar"
  },
  {
    key: "ecms",
    name: "节能方案",
    checkSelector: ".active",
    validClass: ".jazz-ecm-mainpanel .jazz-ecm-notPush"
  },
  {
    key: "savings",
    name: "节能效果",
    checkSelector: ".active",
    validClass: ".jazz-ecm-mainpanel .jazz-ecm-notPush"
  },
  {
    key: "smartdiagnose",
    name: "智能诊断",
    checkSelector: ".jazz-mainmenu-level-main",
    children: [
      {
        key: "Diagnosis_Result",
        name: "诊断结果",
        checkSelector: "[role='menu'] > div"
      },
      {
        key: "iot",
        name: "配置诊断",
        checkSelector: "[role='menu'] > div"
      },
      {
        key: "iot",
        name: "预诊断报告",
        checkSelector: "[role='menu'] > div"
      }
    ]
  },
  {
    key: "dashborad",
    name: "数据分析",
    checkSelector: ".active",
    validClass: ".jazz-new-folder-leftpanel-header"
  },
  {
    key: "dashborad",
    name: "Dashboard",
    checkSelector: ".dashborad"
  }
];
