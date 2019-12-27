//该页面用于配置每个一级导航菜单的链接及相关验证内容
let config = {
  "menuSelector":"div.pop-menu > a",
  "menuItems":[
    {
      "name":"myAsset",
      "isSubMenu": false,
      "url":"/zh-cn/#cCode#/asset/",
      "validClass":["div.pop-viewable-title"]
    },
    {
      "name":"alarmList",
      "isSubMenu": false,
      "url":"/zh-cn/#cCode#/alarm/",
      "validClass":["div.alarm-tab-item"]
    },
    {
      "name":"maintenancePlan",
      "isSubMenu": false,
      "url":"/zh-cn/#cCode#/maintenance/",
      "validClass":["a.maintenance-header-tab"]
    },
    {
      "name":"ticket",
      "isSubMenu": false,
      "url":"/zh-cn/#cCode#/ticket/",
      "validClass":["a.ticket-tab-link"]
    },
    {
      "name":"aftersales",
      "isSubMenu": false,
      "url":"/zh-cn/#cCode#/aftersales/",
      "validClass":["div.ant-tabs-extra-content"]
    },
    {
      "name":"doc",
      "isSubMenu": false,
      "url":"/zh-cn/#cCode#/doc/",
      "validClass":"i.anticon-file-add"
    },
    {
      "name":"comXGatewayManagement",
      "isSubMenu": true,
      "url":"/zh-cn/#cCode#/gateway/comx/",
      "validClass":["div.new-gateway-tools"],
    },
    {
      "name":"IOTGatewayManagement",
      "isSubMenu": true,
      "url":"https://#EMOPHost#/doorbell?path=/gateway/#cId#&sysId=2&spDomain=#spDomain#&userId=#uId#",
      "validClass":["div.gatewayBar"],
    },
    {
      "name":"dataeye",
      "isSubMenu": false,
      "url":"/zh-cn/dataeye?customerId=#cId#&userId=#uId#",
      "validClass":["div.addBoard","div.add-board"],    //因dataEye中有数据和无数据的样式表不一样
    },
    {
      "name":"tagManagement",
      "isSubMenu": false,
      "url":"https://#EMOPHost#/doorbell?path=/tag/#cId#&sysId=2&spDomain=#spDomain#&userId=#uId#",
      "validClass":["div.dropdown-group"],
    }
  ]
}

export default config