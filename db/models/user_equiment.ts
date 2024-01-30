import {TableConfig,sequelize, DataTypes} from '../index.js'
export const user_equiment = sequelize.define("user_equiment", {
    uid: DataTypes.INTEGER,
    胸甲: {
        type: DataTypes.JSON,
        defaultValue: null
    },
    腿甲: {
        type: DataTypes.JSON,
        defaultValue: null
    },
    鞋子: {
      type: DataTypes.JSON,
      defaultValue: null
   },
    法宝: {
       type: DataTypes.JSON,
        defaultValue: null
    }
},{
  ...TableConfig
});
await user_equiment.sync({ alter: true }) 
// user_equiment.sync()
// user_equiment.create({uid:1234})
