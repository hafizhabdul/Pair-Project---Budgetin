'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Transaction, { foreignKey: 'CategoryId' });
      Category.belongsToMany(models.User, { through: models.UserCategory });
    }

    static async getCategoryByName(name) {
      return await this.findOne({ where: { name } });
    }
  }

  Category.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Nama kategori tidak boleh kosong!' },
        notNull: { msg: 'Nama kategori tidak boleh null!' },
        len: {
          args: [3, 50],
          msg: 'Nama kategori harus antara 3 hingga 50 karakter!'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Category',
  });

  return Category;
};