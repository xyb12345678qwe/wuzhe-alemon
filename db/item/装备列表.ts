import { sequelize,TableConfig,Sequelize, DataTypes,Read_json} from '../index.js'

export const 装备列表 = sequelize.define("装备列表", {
    "name": DataTypes.STRING,
    "品级":DataTypes.JSON,
    "class":DataTypes.JSON, 
    "type":DataTypes.JSON,
    "攻击加成":DataTypes.JSON,
    "防御加成":DataTypes.JSON,
    "暴击加成":DataTypes.JSON,
    "爆伤加成":DataTypes.JSON,
    "生命加成":DataTypes.JSON,
    "闪避加成":DataTypes.JSON,
    "价格":DataTypes.JSON,
    "介绍":DataTypes.JSON,
}, {
    ...TableConfig
});
await 装备列表.sync({ force: true });
// 道具列表.sync({ alter: true }) 
let list = await Read_json(4,'/装备列表.json');
list.forEach(item => {
    装备列表.create({
        name:item.name,
        品级:item.品级,
        class:item.class,
        type:item.type,
        攻击加成:item.攻击加成,
        防御加成:item.防御加成,
        生命加成:item.生命加成,
        暴击加成:item.暴击加成,
        爆伤加成:item.爆伤加成,
        闪避加成:item.闪避加成,
        价格:item.价格,
        介绍:item.介绍
    })
})
