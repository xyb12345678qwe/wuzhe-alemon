import { sequelize,TableConfig,Sequelize, DataTypes,Read_json} from '../index.js'
export const 兑换码 = sequelize.define("兑换码", {
    "name":DataTypes.STRING,
    "start_time": {
        type:DataTypes.JSON,
        defaultValue:"无"
    },
    "end_time": {
        type:DataTypes.JSON,
        defaultValue:"无"
    },
    "thing": {
        type:DataTypes.JSON,
        defaultValue:[]
    },
    限制人数: {
        type:DataTypes.JSON,
        defaultValue:"无"
    },
    people:{
        type:DataTypes.JSON,
        defaultValue:[]
    },
}, {
    ...TableConfig
});
// await 兑换码.sync({ force: true });
// let list = await Read_json(4,'/兑换码.json');
// list.forEach(item => {
//     兑换码.create({
//         name:item.name,
//         start_time: item.start_time,
//         end_time:item.end_time,
//         thing:item.thing,
//         限制人数:item.限制人数,
//         people:item.people
//     })
// })
