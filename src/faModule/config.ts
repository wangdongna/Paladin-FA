interface IMenuItem {
  name: string;
  isSubMenu: boolean;
  itemSelector: string;
  validClass: string[];
  hoverSelector?: string;
  subMenuSelector?: string;
}

interface IMenuConfig {
  menuSelector: string;
  menuItems: IMenuItem[];
}

//该页面用于配置每个一级导航菜单的链接及相关验证内容
const config: IMenuConfig = {
  menuSelector: "li.ant-menu-item",
  menuItems: [
    {
      name: "myAsset",
      isSubMenu: false,
      itemSelector: "我的资产",
      validClass: [".pop-asset"]
    },
    {
      name: "alarm",
      isSubMenu: false,
      itemSelector: "故障报警",
      validClass: [".pop-alarm"]
    },
    {
      name: "maintainPlanManagement",
      isSubMenu: true,
      hoverSelector: "ul.ant-menu.menu-content>:nth-child(6)",
      subMenuSelector: "ul[id*=maintenance]>li",
      itemSelector: "计划管理",
      validClass: [".plan-management-main-page"]
    },
    {
      name: "ticketManagement",
      isSubMenu: true,
      hoverSelector: "ul.ant-menu.menu-content>:nth-child(6)",
      subMenuSelector: "ul[id*=maintenance]>:nth-child(2)",
      itemSelector: "工单管理",
      validClass: [".ticket-management-main-page"]
    },
    {
      name: "inspectionProgram",
      isSubMenu: true,
      hoverSelector: "ul.ant-menu.menu-content>:nth-child(6)",
      subMenuSelector: "ul[id*=maintenance]>:nth-child(3)",
      itemSelector: "作业程序",
      validClass: [".inspection-plan-main-page"]
    },
    {
      name: "doc",
      isSubMenu: false,
      itemSelector: "文档管理",
      validClass: [".pop-doc"]
    },
    {
      name: "report",
      isSubMenu: false,
      itemSelector: "报告管理",
      validClass: [".pop-report"]
    },
    {
      name: "diagnose",
      isSubMenu: true,
      hoverSelector: "ul.ant-menu.menu-content>:nth-child(12)",
      subMenuSelector: "ul[id*=diagnose]>li",
      itemSelector: "智能诊断",
      validClass: [".diagnosis-details-container"]
    },
    {
      name: "solution",
      isSubMenu: true,
      hoverSelector: "ul.ant-menu.menu-content>:nth-child(12)",
      subMenuSelector: "ul[id*=diagnose]>:nth-child(2)",
      itemSelector: "改进方案",
      validClass: [".se-pop-solution-panel"]
    },
    {
      name: "dataAnalysis",
      isSubMenu: true,
      hoverSelector: "ul.ant-menu.menu-content>:nth-child(12)",
      subMenuSelector: "ul[id*=diagnose]>:nth-child(3)",
      itemSelector: "数据分析",
      validClass: [".data-analysis"]
    }
  ]
};

export default config;
