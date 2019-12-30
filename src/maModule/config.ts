//该页面用于配置每个一级导航菜单的链接及相关验证内容
let config = {
  "menuSelector":"div.pop-menu > a",
  "menuItems":[
    {
      "name":"myAsset",
      "isSubMenu": false,
      "isOutLink": false,
      "itemSelector":"/asset/",
      "validClass":["div.pop-actionbar-buttons"]
    },
    {
      "name":"alarmList",
      "isSubMenu": false,
      "isOutLink": false,
      "itemSelector":"/alarm/",
      "validClass":["div.alarm-tab-item"]
    },
    {
      "name":"maintenancePlan",
      "isSubMenu": false,
      "isOutLink": false,
      "itemSelector":"/maintenance/",
      "validClass":["a.maintenance-header-tab"]
    },
    {
      "name":"ticket",
      "isSubMenu": false,
      "isOutLink": false,
      "itemSelector":"/ticket/",
      "validClass":["a.ticket-tab-link"]
    },
    {
      "name":"aftersales",
      "isSubMenu": false,
      "isOutLink": false,
      "itemSelector":"/aftersales/",
      "validClass":["div.ant-tabs-extra-content"]
    },
    {
      "name":"doc",
      "isSubMenu": false,
      "isOutLink": false,
      "itemSelector":"/doc/",
      "validClass":["i.anticon-file-add"]
    },
    {
      "name":"comXGatewayManagement",
      "isSubMenu": true,
      "isOutLink": false,
      "hoverSelector":"div.pop-mainmenu-level-main",
      "subMenuSelector":'[role="menu"] > li',
      "itemSelector":"ComX",
      "validClass":["div.new-gateway-tools"],
    },
    {
      "name":"IOTGatewayManagement",
      "isSubMenu": true,
      "isOutLink": true,
      "hoverSelector":"div.pop-mainmenu-level-main",
      "subMenuSelector":'[role="menu"] > li',
      "itemSelector":"IoT",
      "validClass":["div.gatewayBar"],
    },
    {
      "name":"tagManagement",
      "isSubMenu": false,
      "isOutLink": true,
      "itemSelector":"/tag/",
      "validClass":["div.dropdown-group"],
    },
    {
      "name":"dataEye",
      "isSubMenu": false,
      "isOutLink": true,
      "itemSelector":"/dataeye",
      "validClass":["div.board-view-top-menu"],
    }
  ]
}

export default config