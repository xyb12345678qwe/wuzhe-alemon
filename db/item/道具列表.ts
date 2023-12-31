import { sequelize,TableConfig,Sequelize, DataTypes,Read_json} from '../index.js'
export const 道具列表 = sequelize.define("道具列表", {
    "name":DataTypes.STRING,
    "type":DataTypes.STRING,
    "品级":DataTypes.STRING,
    "价格": DataTypes.JSON,
    "介绍":DataTypes.STRING,
    "能否消耗":DataTypes.STRING,
    "万界堂":DataTypes.JSON
}, {
    ...TableConfig
});
await 道具列表.sync({ force: true });
// 道具列表.sync({ alter: true }) 
let list = await Read_json(4,'/道具列表.json');
list.forEach(item => {
    道具列表.create({
        name:item.name,
        type:item.type,
        品级:item.品级,
        "价格": item.价格,
        "介绍":item.介绍,
        "能否消耗":item.能否消耗,
        "万界堂":item.万界堂
    })
})
