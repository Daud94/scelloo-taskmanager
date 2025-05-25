'use strict';
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Tasks', 'dueDate', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    
    await queryInterface.addColumn('Tasks', 'startTime', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    
    await queryInterface.addColumn('Tasks', 'endTime', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    
    await queryInterface.addColumn('Tasks', 'timeSpent', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Time spent on task in minutes'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Tasks', 'dueDate');
    await queryInterface.removeColumn('Tasks', 'startTime');
    await queryInterface.removeColumn('Tasks', 'endTime');
    await queryInterface.removeColumn('Tasks', 'timeSpent');
  }
};