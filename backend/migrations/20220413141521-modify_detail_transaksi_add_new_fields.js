'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'detail_transaksi', // table name
        'total_harga', // new field name
        {
          type: Sequelize.DOUBLE,
          allowNull: false,
        },
      ),
      queryInterface.addColumn(
        'detail_transaksi', // table name
        'total_bayar', // new field name
        {
          type: Sequelize.INTEGER(11),
          allowNull: true,
        },
      ),
    ]);
  },

  async down (queryInterface, Sequelize) {
   // logic for reverting the changes
   return Promise.all([
    queryInterface.removeColumn('detail_transaksi', 'total_harga'),
    queryInterface.removeColumn('detail_transaksi', 'total_bayar')
  ]);
},
};
