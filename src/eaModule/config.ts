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

export const basicConfig: Array<any> = [
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
    validClass: ".jazz-ecm-tabs .selected"
  },
  {
    key: "savings",
    name: "节能效果",
    checkSelector: ".active",
    validClass: ".jazz-save-effect .active"
  },
  {
    key: "smartdiagnose",
    name: "智能诊断",
    checkSelector: ".active",
    children: [
      {
        key: "Diagnosis_Result",
        name: "诊断结果",
        checkSelector: "[role='menu'] > div",
        validClass: ".jazz-diagnose-problem-left-select-time"
      },
      {
        key: "Diagnosis_Configure",
        name: "配置诊断",
        checkSelector: "[role='menu'] > div",
        validClass: ".diagnose-label-list"
      },
      {
        key: "PreDiagnosis",
        name: "预诊断报告",
        checkSelector: "[role='menu'] > div",
        validClass: ".createDiagnose"
      }
    ]
  },
  {
    key: "dataanalysis",
    name: "数据分析",
    checkSelector: ".active",
    children: [
      {
        key: "Data_Analysis",
        name: "数据分析",
        checkSelector: "[role='menu'] > div",
        validClass: ".jazz-new-folder-leftpanel-header"
      },
      {
        key: "Data_Input",
        name: "录入数据",
        checkSelector: "[role='menu'] > div",
        validClass: ".jazz-input-data-content-panel-header"
      }
    ]
  },
  {
    key: "report",
    name: "报告",
    checkSelector: ".active",
    children: [
      {
        key: "Report",
        name: "数据报表",
        checkSelector: "[role='menu'] > div",
        validClass: ".jazz-actuality-item-header-title"
      },
      {
        key: "Algorithm",
        name: "行业算法报告",
        checkSelector: "[role='menu'] > div",
        validClass: ".jazz-home-main-button"
      },
      {
        key: "monthlyReport",
        name: "月度报告",
        checkSelector: "[role='menu'] > div",
        validClass: ".jazz-app-monthly-report-config-title3"
      }
    ]
  },
  {
    key: "customersetting",
    name: "客户配置",
    checkSelector: ".jazz-mainmenu-level-main",
    children: [
      {
        key: "Ptag_Managment",
        name: "数据点配置",
        checkSelector: ".jazz-mainmenu-level-main-list",
        children: [
          {
            key: "Ptag_Managment",
            name: "计量数据P",
            checkSelector: "[role='menu'] > div",
            validClass: ".pop-manage-detail-header-name"
          },
          {
            key: "Vtag_Managment",
            name: "计量数据V",
            checkSelector: "[role='menu'] > div",
            validClass: ".jazz-tag-leftpanel-header-item"
          },
          {
            key: "tag_hierarchy_log",
            name: "配置导入日志",
            checkSelector: "[role='menu'] > div",
            validClass: ".jazz-template-list"
          }
        ]
      },
      {
        key: "hierarchysetting",
        name: "层级配置",
        checkSelector: "[role='menu'] > div",
        children: [
          {
            key: "Hierarchy_Managment",
            name: "层级节点配置",
            checkSelector: "[role='menu'] > div",
            validClass: ".jazz-tag-leftpanel-header-item"
          },
          {
            key: "hierarchy_log",
            name: "配置导入日志",
            checkSelector: "[role='menu'] > div",
            validClass: ".jazz-template-list"
          }
        ]
      },
      {
        key: "gatewaysetting",
        name: "网关管理",
        checkSelector: "[role='menu'] > div",
        children: [
          {
            key: "Virtuat_Gateway",
            name: "虚拟网关",
            checkSelector: "[role='menu'] > div",
            validClass: ".jazz-app-monthly-report-config-title3"
          }
        ]
      },
      {
        key: "dataquality",
        name: "数据质量",
        checkSelector: "[role='menu'] > div",
        children: [
          {
            key: "Data_Validation",
            name: "数据质量维护",
            checkSelector: "[role='menu'] > div",
            validClass: ".data-quality-maintenance-filter-time"
          }
        ]
      },
      {
        key: "customsetting",
        name: "自定义配置",
        checkSelector: "[role='menu'] > div",
        children: [
          {
            key: "KPI_Cycle",
            name: "指标计算周期",
            checkSelector: "[role='menu'] > div",
            validClass: ".header-bar"
          }
        ]
      }
    ]
  },
  {
    key: "dashborad",
    name: "Dashboard",
    checkSelector: ".dashborad",
    validClass: ".navigation-bar"
  }
];
