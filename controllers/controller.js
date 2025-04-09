const { Op } = require('sequelize');
const { UserProfile, User, Transaction, Category, UserCategory } = require('../models'); class Controller {
    static async home(req, res) {
        try {
            const userId = req.session.userId;
            const role = req.session.role;
            const { filterType, filterCategory, sortBy, searchTitle, startDate, endDate, page = 1, success } = req.query;

            const limit = 10; // Jumlah transaksi per halaman
            const offset = (page - 1) * limit;

            // Bangun whereClause menggunakan Op
            let whereClause = role === 'admin' ? {} : { UserId: userId };

            // Filter berdasarkan tipe (income/expense) menggunakan Op.eq
            if (filterType) {
                whereClause.type = { [Op.eq]: filterType };
            }

            // Filter berdasarkan CategoryId menggunakan Op.eq
            if (filterCategory) {
                whereClause.CategoryId = { [Op.eq]: parseInt(filterCategory) };
            }

            // Filter berdasarkan title menggunakan Op.like
            if (searchTitle) {
                whereClause.title = { [Op.like]: `%${searchTitle}%` }; // Pencarian case-insensitive
            }

            // Filter berdasarkan rentang tanggal menggunakan Op.between
            if (startDate && endDate) {
                whereClause.date = {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                };
            } else if (startDate) {
                whereClause.date = { [Op.gte]: new Date(startDate) }; // Hanya tanggal mulai
            } else if (endDate) {
                whereClause.date = { [Op.lte]: new Date(endDate) }; // Hanya tanggal akhir
            }

            // Bangun orderClause untuk sorting
            let orderClause = [];
            if (sortBy === 'amount') {
                orderClause.push(['amount', 'DESC']);
            }
            if (sortBy === 'date') {
                orderClause.push(['date', 'DESC']);
            }

            // Ambil data transaksi dengan filter
            const { count, rows: transactions } = await Transaction.findAndCountAll({
                where: whereClause,
                include: [{ model: Category, attributes: ['name'] }],
                order: orderClause,
                limit,
                offset
            });

            // Hitung total pemasukan dan pengeluaran
            const totalIncomeTransactions = await Transaction.getTransactionsByType('income', userId, role);
            const totalIncome = totalIncomeTransactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);

            const totalExpenseTransactions = await Transaction.getTransactionsByType('expense', userId, role);
            const totalExpense = totalExpenseTransactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);

            const balance = totalIncome - totalExpense;
            const categories = await Category.findAll();

            res.render('home.ejs', {
                data: transactions,
                totalIncome,
                totalExpense,
                balance,
                categories,
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                filterType: filterType || '',
                filterCategory: filterCategory || '',
                sortBy: sortBy || '',
                searchTitle: searchTitle || '', // Kirim searchTitle ke template
                startDate: startDate || '', // Kirim startDate ke template
                endDate: endDate || '', // Kirim endDate ke template
                success: success || null
            });
        } catch (error) {
            throw error;
        }
    }
    static async addTransaction(req, res) {
        try {
            let category = await Category.findAll();
            res.render('addTransaction.ejs', { category }); // Tidak perlu mengirimkan user
        } catch (error) {
            res.send(error);
        }
    }
    static async postTransaction(req, res) {
        try {
            const UserId = req.session.userId;
            const { title, amount, type, date, CategoryId } = req.body;

            await Transaction.create({
                title,
                amount: parseFloat(amount),
                type,
                date,
                UserId,
                CategoryId: parseInt(CategoryId),
            });

            const successMessage = encodeURIComponent('Transaksi berhasil ditambahkan');
            res.redirect(`/?success=${successMessage}`);
        } catch (error) {
            const category = await Category.findAll();
            res.render('addTransaction.ejs', { category, error: error.errors ? error.errors.map(err => err.message).join(', ') : error.message });
        }
    }

    static async addCategory(req, res) {
        try {
            const { name } = req.body;
            await Category.create({ name });
            res.redirect('/categories');
        } catch (error) {
            const categories = await Category.findAll();
            res.render('categoryList.ejs', { categories, error: error.errors ? error.errors.map(err => err.message).join(', ') : error.message });
        }
    }
    static async editTransaction(req, res) {
        try {
            const { id } = req.params;
            const transaction = await Transaction.findByPk(id, { include: Category });
            const categories = await Category.findAll();
            res.render('editTransaction.ejs', { transaction, categories });
        } catch (error) {
            throw error;
        }
    }

    static async postEditTransaction(req, res) {
        try {
            const { id } = req.params;
            const { title, amount, type, date, CategoryId } = req.body;
            await Transaction.update(
                { title, amount: parseFloat(amount), type, date, CategoryId: parseInt(CategoryId) },
                { where: { id } }
            );
            const successMessage = encodeURIComponent('Transaksi berhasil diedit');
            res.redirect(`/?success=${successMessage}`);
        } catch (error) {
            throw error;
        }
    }
    static async deleteTransaction(req, res) {
        try {
            const { id } = req.params;
            await Transaction.destroy({ where: { id } });
            const deleteMessage = encodeURIComponent('Transaksi berhasil dihapus');
            res.redirect(`/?success=${deleteMessage}`);
        } catch (error) {
            throw error;
        }
    }
    static async categoryList(req, res) {
        try {
            const categories = await Category.findAll();
            res.render('categoryList.ejs', { categories });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Controller