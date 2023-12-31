import { sequelize,TableConfig,Sequelize, DataTypes,Read_json} from '../index.js'

export const 灵器列表 = sequelize.define("灵器列表", {
    "name": DataTypes.STRING,
    "品级": DataTypes.STRING,
    "攻击加成": DataTypes.JSON  ,
    "防御加成": DataTypes.JSON  ,
    "生命加成": DataTypes.JSON  ,
    "暴击加成":DataTypes.JSON  ,
    "爆伤加成": DataTypes.JSON  ,
    "闪避加成": DataTypes.JSON  ,
    "等级":{
        type: DataTypes.JSON,
        defaultValue: 1
    },
    "exp":{
        type: DataTypes.JSON,
        defaultValue: 0
    },
}, {
    ...TableConfig
});
// const tableAttributes = await 灵器列表.findAll({raw:true});
// console.log(tableAttributes);
await 灵器列表.sync() 
await 灵器列表.sync({ force: true });
let list = await Read_json(4,'/灵器列表.json');
list.forEach(item => {
    灵器列表.create({name:item.name,品级:item.品级,攻击加成:item.攻击加成,防御加成:item.防御加成,生命加成:item.生命加成,暴击加成:item.暴击加成,爆伤加成:item.爆伤加成,闪避加成:item.闪避加成})
})
