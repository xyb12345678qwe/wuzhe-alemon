import {TableConfig,sequelize, DataTypes} from '../index.js'
export const auction_record = sequelize.define("auction", {
    拍卖物品:{
        type: DataTypes.JSON,
        defaultValue: []
    },
    委托拍卖物品:{
        type: DataTypes.JSON,
        defaultValue: []
    },
    当前拍卖物品:{
        type: DataTypes.JSON,
        defaultValue: null
    }
},{
  ...TableConfig
});
await auction_record.sync({ alter: true }) 