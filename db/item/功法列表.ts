import { sequelize,TableConfig,Sequelize, DataTypes,Read_json} from '../index.js'

export const 功法列表 = sequelize.define("功法列表", {
    "name":DataTypes.STRING,
    "type":DataTypes.STRING,
    "品级":DataTypes.STRING,
    "价格":DataTypes.JSON,
    "介绍":DataTypes.STRING,
    "all_功效":{
        type: DataTypes.JSON,
        defaultValue: []
    },
    "功效": {
        type: DataTypes.JSON,
        defaultValue: {
          "修炼加成": { type: DataTypes.JSON, defaultValue: 0 },
          "攻击加成": { type: DataTypes.JSON, defaultValue: 0 },
          "防御加成": { type: DataTypes.JSON, defaultValue: 0 },
          "生命加成": { type: DataTypes.JSON, defaultValue: 0 },
          "闪避加成": { type: DataTypes.JSON, defaultValue: 0 },
          "暴击加成": { type: DataTypes.JSON, defaultValue: 0 },
          "爆伤加成": { type: DataTypes.JSON, defaultValue: 0 }
        },
      },
    "zhandou":DataTypes.JSON,
    "万界堂":DataTypes.JSON,
    "能否消耗":DataTypes.JSON
}, {
    ...TableConfig
});
await 功法列表.sync({ force: true });
// 道具列表.sync({ alter: true }) 
let list = await Read_json(4,'/功法列表.json');
list.forEach(item => {
    功法列表.create({
        name:item.name,
        type:item.type,
        品级:item.品级,
        价格:item.价格,
        介绍:item.介绍,
        all_功效:item.all_功效,
        zhandou:item.zhandou,
        功效:item.功效,
        万界堂:item.万界堂,
        能否消耗:item.能否消耗
    })
})
