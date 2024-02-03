import { Sequelize } from 'sequelize'
//数据库名   账号名   密码

export const sequelize = new Sequelize(
  process.env?.ALEMONJS_MYSQL_DATABASE ?? 'wuzhe',
  process.env?.ALEMONJS_MYSQL_USER ?? 'wuzhe',
  process.env?.ALEMONJS_MYSQL_PASSWORD,
  {
    host: process.env?.ALEMONJS_MYSQL_HOST,
    port: Number(process.env?.ALEMONJS_MYSQL_PROT),
    dialect: 'mysql',
    logging: false // 禁用日志记录
  }
)

export const TableConfig = {
  freezeTableName: true, //不增加复数表名
  createdAt: false, //去掉
  updatedAt: false //去掉
}
try {
  await sequelize.authenticate()
  console.log('mysql连接成功')
} catch (error) {
  console.error('mysql连接失败:', error)
}
export { Op, literal } from 'sequelize'
