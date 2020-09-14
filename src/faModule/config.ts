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
    }
  ]
};

export default config;
