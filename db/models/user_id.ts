import {TableConfig,sequelize, DataTypes} from '../index.js'
export const user_id = sequelize.define("user_id", {
    uid: DataTypes.INTEGER,
    绑定账号: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    允许绑定账号: {
      type: DataTypes.JSON,
      defaultValue: []
    },
  },{
  ...TableConfig
});

// (async () => {
  await user_id.sync({alter: true}) 
//   user_id.sync({ alter: true }) 
  // await user_id.create({ uid: 123 });
//   const user:any = await user_id.findOne({
//     where: { uid:123  },
//   })
//   if (user) {
//     user.绑定账号.push('1234')
//     console.log(user.绑定账号)
//     await user_id.update(
//       { 绑定账号: user.绑定账号 },
//       { where: { uid: 123 } }
//     );
//   }
// })()
