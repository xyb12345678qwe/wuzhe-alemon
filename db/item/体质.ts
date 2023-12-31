import { sequelize,TableConfig,Sequelize, DataTypes,Read_json} from '../index.js'

export const 体质 = sequelize.define("体质", {
    "name":DataTypes.STRING,
    "type":DataTypes.STRING,
    "修炼加成": DataTypes.JSON,
    "暴击加成": DataTypes.JSON,
    "爆伤加成": DataTypes.JSON,
    "防御加成": DataTypes.JSON,
    "等级":DataTypes.JSON,
    "exp":DataTypes.JSON,
    "生命加成": DataTypes.JSON

}, {
    ...TableConfig
});
await 体质.sync({ force: true });
// 道具列表.sync({ alter: true }) 
let list = await Read_json(4,'/体质.json')
console.log(list);

list.forEach(item => {
    体质.create({
        name:item.name,
        type:item.type,
        修炼加成:item.修炼加成,
        暴击加成:item.暴击加成,
        爆伤加成:item.爆伤加成,
        防御加成:item.防御加成,
        生命加成:item.生命加成,
        等级:item.等级,
        exp:item.exp,
    })
})
