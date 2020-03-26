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
      // {
      //   key: "algorithm_report",
      //   name: "行业算法报告",
      //   validClass: ".jazz-algorithm-main-overview-card"
      // },
      {
        key: "monthly_report",
        name: "月度报告",
        validClass: ".jazz-app-monthly-report-config-title3"
      }
    ]
  },
  {
    key: "customersetting",
    name: "客户配置",
    children: [
      {
        key: "ptag",
        name: "计量数据P",
        validClass: ".pop-manage-detail-header-name"
      },
      {
        key: "vtag",
        name: "计量数据V",
        validClass: ".jazz-tag-leftpanel-header-item"
      },
      {
        key: "tag_import_log",
        name: "配置导入日志",
        validClass: ".jazz-template-list"
      },
      {
        key: "hierarchy",
        name: "层级节点配置",
        validClass: ".jazz-tag-leftpanel-header-item"
      },
      {
        key: "import_log",
        name: "配置导入日志",
        validClass: ".jazz-template-list"
      },
      {
        key: "virtuat_gateway",
        name: "虚拟网关",
        validClass: ".title.customerName",
        outer: true
      },
      {
        key: "data_validation",
        name: "数据质量维护",
        validClass: ".data-quality-maintenance-filter-time"
      },

      {
        key: "kpi_cycle",
        name: "指标计算周期",
        validClass: ".header-bar"
      }
    ]
  },
  {
    key: "dashborad",
    name: "Dashboard",
    validClass: ".board-view-top-menu",
    outer: true
  }
];

export const sysMgmtBtnClass = ".jazz-customer-or-function";

export const sysMgmtPageConfig: Array<MenuConfigObject> = [
  {
    key: "calendar",
    name: "日历配置工休日",
    children: [
      {
        key: "work_day",
        name: "工休日",
        validClass: ".jazz-calendar-title"
      },
      {
        key: "work_time",
        name: "工作时间",
        validClass: ".jazz-calendar-title"
      },
      {
        key: "hc_season",
        name: "冷暖季",
        validClass: ".jazz-calendar-title"
      },
      {
        key: "day_night",
        name: "昼夜时间",
        validClass: ".jazz-calendar-title"
      }
    ]
  },
  {
    key: "Conversion",
    name: "能耗换算",
    children: [
      {
        key: "price",
        name: "价格",
        validClass: ".pop-manage-detail-header-name.jazz-header"
      },
      {
        key: "carbon",
        name: "碳排放",
        validClass: ".jazz-carbon-detail-header-name.jazz-carbon-header"
      }
    ]
  },
  {
    key: "customer",
    name: "客户管理",
    validClass: ".pop-manage-detail-header-name.jazz-header"
  },
  {
    key: "UserManagment",
    name: "用户管理",
    children: [
      {
        key: "user",
        name: "用户管理",
        validClass: ".pop-manage-detail-header-name"
      },
      {
        key: "role",
        name: "功能权限角色",
        validClass: ".pop-manage-detail-header-name.jazz-header"
      }
    ]
  }
];
