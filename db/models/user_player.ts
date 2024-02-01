import { sequelize,TableConfig,user_id,Sequelize, DataTypes} from '../index.js'
export const user_player = sequelize.define("user_player", {
    uid: DataTypes.INTEGER,
        name: DataTypes.JSON,
        性别: DataTypes.JSON,
        宣言: {
          type: DataTypes.JSON,
          defaultValue: '无'
        },
        语言包: DataTypes.JSON,
        武者境界: {
          type: DataTypes.JSON,
          defaultValue: 'F阶低级武者'
          },
          体魄境界: {
          type: DataTypes.JSON,
          defaultValue: '体魄一重天'
          },
          灵魂境界: {
          type: DataTypes.JSON,
          defaultValue: '灵魂境界一重天'
          },
          
          灵气: {
          type: DataTypes.JSON,
          defaultValue: 0
          },
          体魄力量: {
          type: DataTypes.JSON,
          defaultValue: 0
          },
          灵魂力量: {
          type: DataTypes.JSON,
          defaultValue: 0
          },
          攻击加成: {
          type: DataTypes.JSON,
          defaultValue: 100
          },
          防御加成: {
          type: DataTypes.JSON,
          defaultValue: 100
          },
          暴击加成: {
          type: DataTypes.JSON,
          defaultValue: 0.01
          },
          爆伤加成: {
          type: DataTypes.JSON,
          defaultValue: 0.01
          },
          生命加成: {
          type: DataTypes.JSON,
          defaultValue: 100
          },
          闪避加成: {
          type: DataTypes.JSON,
          defaultValue: 0
          },
          修炼加成: {
            type: DataTypes.JSON,
            defaultValue: 0
          },
          当前生命: {
          type: DataTypes.JSON,
          defaultValue: 1000
          },
          生命上限: {
          type: DataTypes.JSON,
          defaultValue: 1000
          },
          金钱: {
          type: DataTypes.JSON,
          defaultValue: 1000
          },
          本命灵器: {
            type: DataTypes.JSON,
            defaultValue: {},
          },
          武者认证: {
          type: DataTypes.JSON,
          defaultValue: '无'
          },
          技能栏: {
          type: DataTypes.JSON,
          defaultValue: { 功法技能栏1: '无', 功法技能栏2: '无', 功法技能栏3: '无', 功法技能栏4: '无', 功法技能栏5: '无' }
          },
          宗门:{
            type: DataTypes.JSON,
            defaultValue:null
          },
          猎妖目标:{
            type: DataTypes.JSON,
            defaultValue:null
          },
          体质: {
            type: DataTypes.JSON,
            defaultValue: "无"
          },
          不朽细胞: {
            type: DataTypes.JSON,
            defaultValue: 0 
          },
          不朽灵器: {
            type: DataTypes.JSON,
            defaultValue: 0 
          },
          秘境目标: {
            type: DataTypes.JSON,
            defaultValue: {}
          }

  }, {
    ...TableConfig
  });
  await user_player.sync({ alter: true }) 
