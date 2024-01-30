import {TableConfig,sequelize, DataTypes} from '../index.js'
export const transaction_record = sequelize.define("transaction_record", {
    开启交易者: {
        type: DataTypes.JSON,
        defaultValue: "无"
    },
    交易对象: {
        type: DataTypes.JSON,
        defaultValue: "无"
    },
    开启交易者是否同意:{
        type: DataTypes.JSON,
        defaultValue: "否"
    },
    交易对象是否同意:{
        type: DataTypes.JSON,
        defaultValue: "否"
    },
    开启交易者交易物品:{
        type: DataTypes.JSON,
        defaultValue: []
    },
    交易对象交易物品:{
        type: DataTypes.JSON,
        defaultValue: []
    },
    开启时间:{
        type: DataTypes.JSON,
        defaultValue: null
    },
    结束时间: {
        type: DataTypes.JSON,
        defaultValue: "无"
    },
    交易总金额: {
        type: DataTypes.JSON,
        defaultValue: 0
    },
    结束状态: {
        type: DataTypes.JSON,
        defaultValue: "未结束"
    }
},{
  ...TableConfig
});
await transaction_record.sync({ alter: true }) 