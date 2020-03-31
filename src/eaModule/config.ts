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
    validClass: ".jazz-home-main .jazz-home-main-chart"
  },
  {
    key: "kpi",
    name: "指标现状",
    validClass: ".jazz-actuality-item .action-bar"
  },
  {
    key: "ecms",
    name: "节能方案",
    validClass: ".jazz-ecm-tabs .selected"
  },
  {
    key: "savings",
    name: "节能效果",
    validClass: ".jazz-save-effect .active"
  },
  {
    key: "smartdiagnose",
    name: "智能诊断",
    children: [
      {
        key: "diagnosis",
        name: "诊断结果",
        validClass: ".jazz-diagnose-problem-left-select-time"
      },
      {
        key: "configure_diagnosis",
        name: "配置诊断",
        validClass: ".diagnose-label-list"
      },
      {
        key: "pre-diagnostic_report",
        name: "预诊断报告",
        validClass: ".createDiagnose"
      }
    ]
  },
  {
    key: "dataanalysis",
    name: "数据分析",
    children: [
      {
        key: "data_analysis",
        name: "数据分析",
        validClass: ".jazz-new-folder-leftpanel-header"
      },
      {
        key: "input_data",
        name: "录入数据",
        validClass: ".jazz-input-data-content-panel-header"
      }
    ]
  },
  {
    key: "Report",
    name: "报告",
    children: [
      {
        key: "report",
        name: "数据报表",
        validClass: ".jazz-report-chart-table-header-action"
      },
      {
        key: "algorithm_report",
        name: "行业算法报告",
        validClass: ".jazz-algorithm-main-overview-card"
      },
      {
        key: "monthly_report",
        name: "月度报告",
        validClass: ".jazz-app-monthly-report-config-title3"
      }
    ]
  }
];
