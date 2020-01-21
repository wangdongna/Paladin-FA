//该页面用于配置每个一级导航菜单的链接及相关验证内容
let config = {
    "menuSelector":"li.ant-menu-item",
    "menuItems":[
      {
        "name":"myAsset",
        "isSubMenu": false,
        "isOutLink": false,
        "itemSelector":"我的资产",
        "validClass":["div.pop-asset"]
      },
      {
        "name":"alarm",
        "isSubMenu": false,
        "isOutLink": false,
        "itemSelector":"故障报警",
        "validClass":["div.pop-alarm"]
      },
      {
        "name":"maintainPlanManagement",
        "isSubMenu": true,
        "isOutLink": false,
        "hoverSelector":"ul.ant-menu.menu-content>:nth-child(6)",
        "subMenuSelector":'ul[id*=maintenance]>li',
        "itemSelector":"计划管理",
        "validClass":["div.ant-row.plan-management-main-page"]
      },
      {
        "name":"ticketManagement",
        "isSubMenu": true,
        "isOutLink": false,
        "hoverSelector":"ul.ant-menu.menu-content>:nth-child(6)",
        "subMenuSelector":'ul[id*=maintenance]>li',
        "itemSelector":"工单管理",
        "validClass":["div.ant-row.ticket-management-main-page"]
      },
      {
        "name":"inspectionProgram",
        "isSubMenu": true,
        "isOutLink": false,
        "hoverSelector":"ul.ant-menu.menu-content>:nth-child(6)",
        "subMenuSelector":'ul[id*=maintenance]>li',
        "itemSelector":"作业程序",
        "validClass":["div.ant-row.ticket-management-main-page"]
      },
      {
        "name":"doc",
        "isSubMenu": false,
        "isOutLink": false,
        "itemSelector":"文档管理",
        "validClass":["div.pop-doc"]
      },
      {
        "name":"report",
        "isSubMenu": false,
        "isOutLink": false,
        "itemSelector":"报告管理",
        "validClass":["div.pop-report"]
      },
      {
        "name":"diagnose",
        "isSubMenu": true,
        "isOutLink": false,
        "hoverSelector":"ul.ant-menu.menu-content>:nth-child(12)",
        "subMenuSelector":'ul[id*=diagnose]>li',
        "itemSelector":"智能诊断",
        "validClass":["div.ant-spin-nested-loading.diagnosis-details-container"]
      },
      {
        "name":"dataAnalysis",
        "isSubMenu": true,
        "isOutLink": false,
        "hoverSelector":"ul.ant-menu.menu-content>:nth-child(12)",
        "subMenuSelector":'ul[id*=diagnose]>li',
        "itemSelector":"改进方案",
        "validClass":["div.tab-row"]
      },
      {
        "name":"solution",
        "isSubMenu": true,
        "isOutLink": false,
        "hoverSelector":"ul.ant-menu.menu-content>:nth-child(12)",
        "subMenuSelector":'ul[id*=diagnose]>li',
        "itemSelector":"数据分析",
        "validClass":["div.data-analysis"]
      },
      {
        "name":"tag",
        "isSubMenu": true,
        "isOutLink": true,
        "hoverSelector":"ul.ant-menu.menu-content>:nth-child(12)",
        "subMenuSelector":'ul[id*=diagnose]>li',
        "itemSelector":"数据点管理",
        "validClass":["div.dropdown-group"]
      },
      {
        "name":"comXGateway",
        "isSubMenu": true,
        "isOutLink": false,
        "hoverSelector":"ul.ant-menu.menu-content>:nth-child(14)",
        "subMenuSelector":'ul[id*=gateway]>li',
        "itemSelector":"2015版BOX",
        "validClass":["div.dropdown-group"]
      },
      {
        "name":"IOTGateway",
        "isSubMenu": true,
        "isOutLink": true,
        "hoverSelector":"ul.ant-menu.menu-content>:nth-child(14)",
        "subMenuSelector":'ul[id*=gateway]>li',
        "itemSelector":"LVCOMXBOX",
        "validClass":["div.gatewayBar"]
      },
      {
        "name":"vitualGateway",
        "isSubMenu": true,
        "isOutLink": true,
        "hoverSelector":"ul.ant-menu.menu-content>:nth-child(14)",
        "subMenuSelector":'ul[id*=gateway]>li',
        "itemSelector":"虚拟网关",
        "validClass":["div.gatewayBar"]
      },
      {
        "name":"template",
        "isSubMenu": true,
        "isOutLink": true,
        "hoverSelector":"ul.ant-menu.menu-content>:nth-child(14)",
        "subMenuSelector":'ul[id*=gateway]>li',
        "itemSelector":"模板库管理",
        "validClass":["div.template"]
      },
      {
        "name":"dataEye",
        "isSubMenu": false,
        "isOutLink": true,
        "itemSelector":"数据看板",
        "validClass":["div.board-view-top-menu"]
      }
    ]
  }
  
  export default config