import {TableConfig,sequelize, DataTypes} from '../index.js'
export const user_zongmen = sequelize.define("user_zongmen", {
    "name":DataTypes.STRING,
    "宗主":DataTypes.INTEGER,
    "钱库":{
        type:DataTypes.JSON,
        defaultValue:0,
    },
    "宗门等级":{
        type:DataTypes.JSON,
        defaultValue:0,
    },
    "副宗主":{
        type:DataTypes.JSON,
        defaultValue:[]
    },
    "长老":{
        type:DataTypes.JSON,
        defaultValue:[]
    },
    "成员":{
        type:DataTypes.JSON,
        defaultValue:[]
    },
    "修炼加成":{
        type:DataTypes.JSON,
        defaultValue:0
    },
    "加入最高境界":{
        type:DataTypes.STRING,
        defaultValue:"无"
    },
    "加入最低境界":{
        type:DataTypes.STRING,
        defaultValue:"无"
    },
    "建立时间":DataTypes.STRING,
    "宗门阵法石":{
        type:DataTypes.JSON,
        defaultValue:{
            "阵法石1":"无",
            "阵法石2":"无",
            "阵法石3":"无",
            "阵法石5":"无",
            "阵法石6":"无"
        }
    }
},{
  ...TableConfig
});
await user_zongmen.sync({ alter: true }) 
// user_equiment.sync()
// user_equiment.create({uid:1234})
