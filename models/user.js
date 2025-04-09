'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require('bcryptjs')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasOne(models.UserProfile, { foreignKey: 'UserId' })
      User.hasMany(models.Transaction, { foreignKey: 'CategoryId' })
      User.belongsToMany(models.Category, { through: models.UserCategory })
    }
  }
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  User.beforeCreate(async (instance, opt) => {
    // console.log(instance, '<<<<before create');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(instance.password, salt);

    instance.password = hash
    
  })
  return User;
};