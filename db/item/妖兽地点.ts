import { sequelize,TableConfig,Sequelize, DataTypes,Read_json} from '../index.js'

export const 妖兽地点 = sequelize.define("妖兽地点", {
    "name": DataTypes.STRING,
	"妖兽": {
        type: DataTypes.JSON,
        defaultValue: []
    },
	"time": {
        type: DataTypes.JSON,
        defaultValue: 0
    }
}, {
    ...TableConfig
});
await 妖兽地点.sync({ force: true });
// 道具列表.sync({ alter: true }) 
let list = await Read_json(4,'/妖兽地点.json');
list.forEach(item => {
    妖兽地点.create({
        name:item.name,
        妖兽:item.妖兽,
        time:item.time
    })
})
