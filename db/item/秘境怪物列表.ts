import { sequelize,TableConfig,Sequelize, DataTypes,Read_json} from '../index.js'

export const 秘境怪物列表 = sequelize.define("秘境怪物列表", {
    "name": DataTypes.STRING,
    "攻击加成":DataTypes.JSON,
    "防御加成":DataTypes.JSON,
    "暴击加成":DataTypes.JSON,
    "爆伤加成":DataTypes.JSON,
    "生命加成":DataTypes.JSON,
    "闪避加成":DataTypes.JSON,
    "对应秘境":DataTypes.JSON,
}, {
    ...TableConfig
});
await 秘境怪物列表.sync({ force: true });
// 道具列表.sync({ alter: true }) 
let list = await Read_json(4,'/秘境怪物列表.json');
let records = list.map(item => ({
        name:item.name,
        攻击加成:item.攻击加成,
        防御加成:item.防御加成,
        生命加成:item.生命加成,
        暴击加成:item.暴击加成,
        爆伤加成:item.爆伤加成,
        闪避加成:item.闪避加成,
        对应秘境:item.对应秘境
    })
)

await 秘境怪物列表.bulkCreate(records);