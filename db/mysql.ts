import { Sequelize } from 'sequelize'
                                      //数据库名   账号名   密码
// export const sequelize = new Sequelize('wuzhe', 'wuzhe', 'xxxxs', {
//   host: 'xxxx', //地址ip
//   port: 3306, //端口,默认是3306
//   dialect: 'mysql',
//   logging: false, // 禁用日志记录
// })
export const sequelize = new Sequelize('wuzhe', 'wuzhe', '12345678qwe', {
    host: '156.224.22.47',
    port: 3306,
    dialect: 'mysql',
    logging: false, // 禁用日志记录
  })

export const TableConfig = {
  freezeTableName: true, //不增加复数表名
  createdAt: false, //去掉
  updatedAt: false //去掉
}
try {
    await sequelize.authenticate();
    console.log('mysql连接成功');
  } catch (error) {
    console.error('mysql连接失败:', error);
}
export { Op, literal } from 'sequelize'