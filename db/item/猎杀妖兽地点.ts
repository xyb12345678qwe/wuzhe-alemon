import { sequelize,TableConfig,Sequelize, DataTypes,Read_json} from '../index.js'

export const 猎杀妖兽地点 = sequelize.define("猎杀妖兽地点", {
    "name":DataTypes.STRING,
    掉落物:{
        type:DataTypes.JSON,
        defaultValue:[]
    },
    "攻击加成": DataTypes.JSON,
    "防御加成": DataTypes.JSON,
    "暴击加成": DataTypes.JSON,
    "爆伤加成": DataTypes.JSON,
    "生命加成": DataTypes.JSON,
    "闪避加成": DataTypes.JSON,
}, {
    ...TableConfig
});
await 猎杀妖兽地点.sync({ force: true });
// 道具列表.sync({ alter: true }) 
let list = await Read_json(4,'/猎杀妖兽地点.json');
list.forEach(item => {
    猎杀妖兽地点.create({
        name:item.name,
        掉落物:item.掉落物,
        攻击加成:item.攻击加成,
        防御加成:item.防御加成,
        暴击加成:item.暴击加成,
        爆伤加成:item.爆伤加成,
        生命加成:item.生命加成,
        闪避加成:item.闪避加成,
    })
})
