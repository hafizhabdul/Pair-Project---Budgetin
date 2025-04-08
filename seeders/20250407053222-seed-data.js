'use strict';
const fs = require('fs').promises

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let category = JSON.parse(await fs.readFile('./data/category.json', 'utf-8')).map(el => {
      delete el.id
      return el
    })
    let user = JSON.parse(await fs.readFile('./data/user.json', 'utf-8')).map(el => {
      delete el.id
      return el
    })
    let userCategory = JSON.parse(await fs.readFile('./data/userCategory.json', 'utf-8')).map(el => {
      delete el.id
      return el
    })
    let transaction = JSON.parse(await fs.readFile('./data/transaction.json', 'utf-8')).map(el => {
      delete el.id
      return el
    })
    let userProfile = JSON.parse(await fs.readFile('./data/userProfile.json', 'utf-8')).map(el => {
      delete el.id
      return el
    })

    await queryInterface.bulkInsert('Users', user, {});
    await queryInterface.bulkInsert('Categories', category, {});
    await queryInterface.bulkInsert('UserCategories', userCategory, {});
    await queryInterface.bulkInsert('Transactions', transaction, {});
    await queryInterface.bulkInsert('UserProfiles', userProfile, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('Categories', null, {});
    await queryInterface.bulkDelete('UserCategories', null, {});
    await queryInterface.bulkDelete('Transactions', null, {});
    await queryInterface.bulkDelete('UserProfiles', null, {});
  }
};
