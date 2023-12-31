'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user_id', {
      uid: DataTypes.INTEGER,
      绑定账号: {
        type: DataTypes.JSON,
        defaultValue: []
      },
      允许绑定账号: {
        type: DataTypes.JSON,
        defaultValue: []
      },
    });
  },

  // down: async (queryInterface, Sequelize) => {
  //   await queryInterface.removeColumn('user_id', '嘿嘿');
  // }
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_id');
  }
}