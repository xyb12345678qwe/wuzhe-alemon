import { sequelize,TableConfig,Sequelize, DataTypes,Read_json} from '../index.js'

export const 灵魂境界 = sequelize.define("灵魂境界", {
    "name": DataTypes.STRING,
    "灵魂力量":DataTypes.JSON,
    "攻击加成": DataTypes.JSON,
    "防御加成": DataTypes.JSON,
    "暴击加成": DataTypes.JSON,
    "爆伤加成": DataTypes.JSON,
    "生命加成": DataTypes.JSON,
    "闪避加成": DataTypes.JSON
}, {
    ...TableConfig
});

await 灵魂境界.sync({ force: true });
// 道具列表.sync({ alter: true }) 
let list = await Read_json(4,'/灵魂境界.json');
list.forEach(item => {
    灵魂境界.create({
        name:item.name,
        灵魂力量:item.灵魂力量,
        攻击加成:item.攻击加成,
        防御加成:item.防御加成,
        生命加成:item.生命加成,
        暴击加成:item.暴击加成,
        爆伤加成:item.爆伤加成,
        闪避加成:item.闪避加成
    })
})