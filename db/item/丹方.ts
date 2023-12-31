
import { sequelize,TableConfig,Sequelize, DataTypes,Read_json} from '../index.js'
export const 丹方 = sequelize.define("丹方", {
    "name":DataTypes.STRING,
    材料:{
        type:DataTypes.JSON,
        defaultValue:[]
    }
}, {
    ...TableConfig
});
await 丹方.sync({ force: true });
// 道具列表.sync({ alter: true }) 
let list = await Read_json(4,'/丹方.json');
list.forEach(item => {
    丹方.create({
        name:item.name,
        材料:item.材料
    })
})
