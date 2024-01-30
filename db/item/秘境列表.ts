import { sequelize,TableConfig,Sequelize, DataTypes,Read_json} from '../index.js'

export const 秘境列表 = sequelize.define("秘境列表", {
    "name": DataTypes.STRING,
    "price":DataTypes.JSON,
    "thing":DataTypes.JSON,
}, {
    ...TableConfig
});
await 秘境列表.sync({ force: true });
// 道具列表.sync({ alter: true }) 
let list = await Read_json(4,'/秘境列表.json');
let records = list.map(item => ({
        name:item.name,
        price:item.price,
        thing:item.thing,
    })
)

await 秘境列表.bulkCreate(records);