'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class User extends Sequelize.Model {}
  User.init({
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    emailAddress: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
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

  User.associate = (models) => {
    // TODO Add associations.
    User.hasMany(models.Course, {
        as: 'course',
        foreignKey: {
          fieldName: 'userId',
          allowNull: false,
        },
    });
  };

  return User;
};
