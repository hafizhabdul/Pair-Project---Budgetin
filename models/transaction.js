'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Transaction.belongsTo(models.Category, {foreignKey: 'CategoryId'})
      Transaction.belongsTo(models.User, {foreignKey: 'UserId'})
    }
  }
  Transaction.init({
    title: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    type: DataTypes.STRING,
    date: DataTypes.DATE,
    UserId: DataTypes.INTEGER,
    CategoryId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Transaction',
  });
  return Transaction;
};