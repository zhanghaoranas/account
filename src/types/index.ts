// 项目账号信息接口
export interface ProjectInfo {
  customerName: string; // 客户名称
  projectName: string; // 项目名称
  projectUrl: string; // 项目地址
  tenant?: string; // 租户
  account: string; // 项目账号
  password: string; // 项目密码
  remark?: string; // 备注
}
