import { sequelize,TableConfig,Sequelize, DataTypes,Read_json} from '../index.js'

export const 体魄境界 = sequelize.define("体魄境界", {
    "name": DataTypes.STRING,
    "体魄力量":DataTypes.JSON,
    "攻击加成": DataTypes.JSON,
    "防御加成": DataTypes.JSON,
    "暴击加成": DataTypes.JSON,
    "爆伤加成": DataTypes.JSON,
    "生命加成": DataTypes.JSON,
    "闪避加成": DataTypes.JSON
}, {
    ...TableConfig
});
await 体魄境界.sync({ force: true });
let list = await Read_json(4, '/体魄境界.json');
let records = list.map(item => ({
  name: item.name,
  体魄力量: item.体魄力量,
  攻击加成: item.攻击加成,
  防御加成: item.防御加成,
  生命加成: item.生命加成,
  暴击加成: item.暴击加成,
  爆伤加成: item.爆伤加成,
  闪避加成: item.闪避加成,
}));

await 体魄境界.bulkCreate(records);
