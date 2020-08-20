'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Course extends Sequelize.Model {}
  Course.init({
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
        type: Sequelize.INTEGER
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    estimatedTime: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    materialsNeeded: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: new Date()
    },
    updatedAt: {
        type: Sequelize.DATE,
        defaultValue: new Date()
    }
  }, { sequelize });

  Course.associate = (models) => {
    // TODO Add associations.
    Course.belongsTo(models.User, {
        as: 'course',
        foreignKey: {
          fieldName: 'userId',
          allowNull: false,
        },
    });
  };

  return Course;
};
