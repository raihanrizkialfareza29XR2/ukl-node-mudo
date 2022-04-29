'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'detail_transaksi', // table name
        'kembalian', // new field name
        {
          type: Sequelize.DOUBLE,
          allowNull: true,
        },
      ),
    ]);
  },

  async down (queryInterface, Sequelize) {
   // logic for reverting the changes
   return Promise.all([
    queryInterface.removeColumn('detail_transaksi', 'kembalian')
  ]);
},
};
