'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('paket', {
      id_paket: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(11)
      },
      id_outlet: {
        type: Sequelize.INTEGER(11),
        references:{
          model:"outlet",
          key:"id_outlet"
        }
      },
      jenis: {
        type: Sequelize.ENUM,
        values: ['kiloan','selimut','bedcover','kaos']
      },
      nama_paket: {
        type: Sequelize.STRING(100)
      },
      harga: {
        type: Sequelize.INTEGER(11)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('paket');
  }
};