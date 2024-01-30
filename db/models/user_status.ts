import {TableConfig,sequelize, DataTypes} from '../index.js'
export const user_status = sequelize.define("user_status", {
    uid: DataTypes.INTEGER,
    打工: { type: DataTypes.JSON, defaultValue: 0 },
    修炼: { type: DataTypes.JSON, defaultValue: 0 },
    锻炼: { type: DataTypes.JSON, defaultValue: 0 },
    修炼灵魂: { type: DataTypes.JSON, defaultValue: 0 },
    猎杀妖兽: { type: DataTypes.JSON, defaultValue: 0 },
    猎妖: { type: DataTypes.JSON, defaultValue: 0 },
    采药: { type: DataTypes.JSON, defaultValue: 0 },
    秘境:{ type: DataTypes.JSON, defaultValue: 0 },
},{
  ...TableConfig
});
user_status.sync({alter:true})
// user_status.create({uid:1234})