'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      Transaction.belongsTo(models.User, { foreignKey: 'UserId' });
      Transaction.belongsTo(models.Category, { foreignKey: 'CategoryId' });
    }

    static async getTransactionsByType(type, userId, role) {
      const where = { type };
      if (role !== 'admin') {
        where.UserId = userId;
      }
      return await this.findAll({
        where,
        include: [{ model: sequelize.models.Category, attributes: ['name'] }],
      });
    }

    get formattedDate() {
      return new Date(this.date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    }
  }

  Transaction.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Judul tidak boleh kosong!' },
        notNull: { msg: 'Judul tidak boleh null!' }
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notNull: { msg: 'Jumlah tidak boleh null!' },
        notEmpty: { msg: 'Jumlah tidak boleh kosong!' }, 
        isDecimal: { msg: 'Jumlah harus berupa angka desimal!' }, 
        isPositive(value) {
          if (parseFloat(value) <= 0) {
            throw new Error('Jumlah harus lebih besar dari 0!');
          }
        }
      }
    },
    type: {
      type: DataTypes.ENUM('income', 'expense'),
      allowNull: false,
      validate: {
        notNull: { msg: 'Tipe tidak boleh null!' },
        notEmpty: { msg: 'Tipe tidak boleh kosong!' }, 
        isIn: {
          args: [['income', 'expense']],
          msg: 'Tipe harus income atau expense!'
        }
      }
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: { msg: 'Tanggal tidak boleh null!' },
        notEmpty: { msg: 'Tanggal tidak boleh kosong!' },
        notInFuture(value) {
          if (new Date(value) > new Date()) {
            throw new Error('Tanggal tidak boleh di masa depan!');
          }
        }
      }
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'UserId tidak boleh null!' }
      }
    },
    CategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'Kategori tidak boleh null!' },
        notEmpty: { msg: 'Kategori tidak boleh kosong!' }
      }
    }
  }, {
    sequelize,
    modelName: 'Transaction',
    hooks: {
      beforeCreate: (transaction, options) => {
        if (!transaction.date) {
          transaction.date = new Date();
        }
      },
      afterCreate: (transaction, options) => {
        console.log(`Transaksi baru dibuat: ${transaction.title} dengan jumlah Rp ${transaction.amount}`);
      }
    }
  });

  return Transaction;
};