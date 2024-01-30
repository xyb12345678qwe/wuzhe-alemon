import {TableConfig,sequelize, DataTypes} from '../index.js'
export const user_bag = sequelize.define("user_bag", {
    uid: DataTypes.INTEGER,
    道具:{
        type: DataTypes.JSON,
        defaultValue: []
      },
    功法: {
        type: DataTypes.JSON,
        defaultValue: []
      },
    "已学习功法": {
        type: DataTypes.JSON,
        defaultValue: []
    },
},{
  ...TableConfig
});
await user_bag.sync({ alter: true }) 
// user_bag.create({uid:1234}) 