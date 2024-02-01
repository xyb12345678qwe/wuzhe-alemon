import {TableConfig,sequelize, DataTypes} from '../index.js'
export const 武圣塔 = sequelize.define("武圣塔", {
    uid:DataTypes.INTEGER,
    name: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    武圣名:{
        type: DataTypes.JSON,
        defaultValue: null
    },
    武圣实力:{
        type: DataTypes.JSON,
        defaultValue: null
    },
    挑战者:{
        type: DataTypes.JSON,
        defaultValue: null
    }
},{
  ...TableConfig
});
await 武圣塔.sync({ alter: true }) 

