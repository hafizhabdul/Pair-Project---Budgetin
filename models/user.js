'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.UserProfile, { foreignKey: 'UserId' });
      User.hasMany(models.Transaction, { foreignKey: 'UserId' }); 
      User.belongsToMany(models.Category, { through: models.UserCategory });
    }
  }

  User.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Nama tidak boleh kosong!' },
        notNull: { msg: 'Nama tidak boleh null!' }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, 
      validate: {
        notEmpty: { msg: 'Email tidak boleh kosong!' },
        notNull: { msg: 'Email tidak boleh null!' },
        isEmail: { msg: 'Format email tidak valid!' } 
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Password tidak boleh kosong!' },
        notNull: { msg: 'Password tidak boleh null!' }
      }
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Role tidak boleh kosong!' },
        notNull: { msg: 'Role tidak boleh null!' }
      }
    }
  }, {
    sequelize,
    modelName: 'User',
  });

  User.beforeCreate(async (instance, opt) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(instance.password, salt);
    instance.password = hash;
  });

  return User;
};