//该页面用于配置每个一级导航菜单的链接及相关验证内容
let config = {
  menuSelector: ".pop-mainmenu li",
  taskCenterItem: {
    name: "task",
    text: "任务中心",
    isSubMenu: false,
    isOutLink: false,
    validClass: ".task-slider-item"
  },
  menuItems: [
    {
      name: "myAsset",
      text: "我的设备",
      isSubMenu: false,
      isOutLink: false,
      validClass: ".pop-asset"
    },
    {
      name: "alarmList",
      text: "故障报警",
      isSubMenu: false,
      isOutLink: false,
      validClass: ".pop-alarm"
    },
    {
      name: "maintenancePlan",
      text: "维护计划",
      isSubMenu: false,
      isOutLink: false,
      validClass: ".maintenance"
    },
    {
      name: "ticket",
      text: "工单管理",
      isSubMenu: false,
      isOutLink: false,
      validClass: ".ticket-list"
    },
    {
      name: "doc",
      text: "文档管理",
      isSubMenu: false,
      isOutLink: false,
      validClass: ".pop-doc"
    },
    {
      name: "report",
      text: "报告管理",
      isSubMenu: false,
      isOutLink: false,
      validClass: ".pop-report"
    },
    // {
    //   name: "physics",
    //   text: "IoT物理网关",
    //   isSubMenu: true,
    //   isOutLink: true,
    //   hoverSelector: "li.main-menu-has-subMenuList",
    //   subMenuSelector: '.ant-menu-vertical[role="menu"] > li',
    //   validClass: ".gateway"
    // },
    {
      name: "offline-alarm",
      text: "网关离线报警",
      isSubMenu: true,
      isOutLink: false,
      hoverSelector: "li.main-menu-has-subMenuList",
      subMenuSelector: '.ant-menu-vertical[role="menu"] > li',
      validClass: ".pop-alarm"
    }
    // {
    //   name: "template",
    //   text: "模板库管理",
    //   isSubMenu: true,
    //   isOutLink: true,
    //   hoverSelector: "li.main-menu-has-subMenuList",
    //   subMenuSelector: '.ant-menu-vertical[role="menu"] > li',
    //   validClass: ".template"
    // },
    // {
    //   name: "board",
    //   text: "数据看板",
    //   isSubMenu: false,
    //   isOutLink: true,
    //   validClass: ".board-container"
    // }
  ]
};

export default config;
