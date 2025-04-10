const { Op, Sequelize } = require('sequelize');
const { sequelize } = require('../models');
const { UserProfile, User, Transaction, Category, UserCategory } = require('../models');
const { Parser } = require('json2csv'); 
const PDFDocument = require('pdfkit'); 

const path = require('path'); // Untuk akses path file logo

class Controller {
    static async landingPage(req, res) {
        try {
            res.render('landing.ejs');
        } catch (error) {
            res.send(error);
        }
    }

    static async home(req, res) {
        try {
            const userId = req.session.userId;
            const role = req.session.role;
            const { filterType, filterCategory, sortBy, searchTitle, startDate, endDate, page = 1, success } = req.query;

            const limit = 5; // Jumlah transaksi per halaman
            const offset = (page - 1) * limit;

            let whereClause = role === 'admin' ? {} : { UserId: userId };
            if (filterType) whereClause.type = { [Op.eq]: filterType };
            if (filterCategory) whereClause.CategoryId = { [Op.eq]: parseInt(filterCategory) };
            if (searchTitle) whereClause.title = { [Op.like]: `%${searchTitle}%` };
            if (startDate && endDate) {
                whereClause.date = { [Op.between]: [new Date(startDate), new Date(endDate)] };
            } else if (startDate) {
                whereClause.date = { [Op.gte]: new Date(startDate) };
            } else if (endDate) {
                whereClause.date = { [Op.lte]: new Date(endDate) };
            }

            let orderClause = [];
            if (sortBy === 'amount') orderClause.push(['amount', 'DESC']);
            if (sortBy === 'date') orderClause.push(['date', 'DESC']);

            const { count, rows: transactions } = await Transaction.findAndCountAll({
                where: whereClause,
                include: [{ model: Category, attributes: ['name'] }],
                order: orderClause,
                limit,
                offset
            });

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
                searchTitle: searchTitle || '',
                startDate: startDate || '',
                endDate: endDate || '',
                success: success || null
            });
        } catch (error) {
            throw error;
        }
    }

    // Method untuk ekspor CSV
    static async exportToCSV(req, res) {
        try {
            const userId = req.session.userId;
            const role = req.session.role;

            
            const whereClause = role === 'admin' ? {} : { UserId: userId };
            const transactions = await Transaction.findAll({
                where: whereClause,
                include: [{ model: Category, attributes: ['name'] }],
            });

            // Format data untuk CSV
            const csvData = transactions.map(t => ({
                Judul: t.title,
                Jumlah: `Rp ${parseFloat(t.amount).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                Tipe: t.type,
                Tanggal: new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
                Kategori: t.Category.name
            }));

            const fields = ['Judul', 'Jumlah', 'Tipe', 'Tanggal', 'Kategori'];
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(csvData);

            // Kirim file CSV sebagai respons
            res.header('Content-Type', 'text/csv');
            res.header('Content-Disposition', 'attachment; filename="transaksi.csv"');
            res.send(csv);
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    // Method untuk ekspor PDF
    static async exportToPDF(req, res) {
        try {
            const userId = req.session.userId;
            const role = req.session.role;

            // Ambil semua transaksi pengguna tanpa pagination
            const whereClause = role === 'admin' ? {} : { UserId: userId };
            const transactions = await Transaction.findAll({
                where: whereClause,
                include: [{ model: Category, attributes: ['name'] }],
            });

            // Buat dokumen PDF
            const doc = new PDFDocument({ margin: 50 });
            let buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                let pdfData = Buffer.concat(buffers);
                res.header('Content-Type', 'application/pdf');
                res.header('Content-Disposition', 'attachment; filename="transaksi.pdf"');
                res.send(pdfData);
            });

            // Tambahkan logo perusahaan
            const logoPath = path.join(__dirname, '../logo.png');
            doc.image(logoPath, 50, 30, { width: 100 }); // Sesuaikan posisi dan ukuran

            // Header
            doc.fontSize(20)
               .font('Helvetica-Bold')
               .fillColor('#4e5f8b')
               .text('Daftar Transaksi - Budgetin', 200, 50, { align: 'center' });
            doc.moveDown(2);

            // Definisikan kolom tabel
            const tableTop = 150;
            const tableLeft = 50;
            const columnWidths = [150, 100, 80, 120, 100]; // Judul, Jumlah, Tipe, Tanggal, Kategori
            const rowHeight = 20;

            // Gambar header tabel
            doc.fontSize(12)
               .font('Helvetica-Bold')
               .fillColor('#ffffff');
            doc.rect(tableLeft, tableTop, columnWidths.reduce((a, b) => a + b), rowHeight)
               .fill('#4e5f8b');
            doc.fillColor('#ffffff')
               .text('Judul', tableLeft + 5, tableTop + 5)
               .text('Jumlah', tableLeft + columnWidths[0] + 5, tableTop + 5, { align: 'right' })
               .text('Tipe', tableLeft + columnWidths[0] + columnWidths[1] + 5, tableTop + 5, { align: 'center' })
               .text('Tanggal', tableLeft + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5, tableTop + 5)
               .text('Kategori', tableLeft + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + 5, tableTop + 5);

            // Gambar garis tabel
            let y = tableTop + rowHeight;
            doc.fontSize(10)
               .font('Helvetica')
               .fillColor('#000000');

            transactions.forEach((t, index) => {
                const rowY = y + (index * rowHeight);

                // Isi data
                doc.text(t.title, tableLeft + 5, rowY + 5, { width: columnWidths[0] - 10, continued: false })
                   .text(`Rp ${parseFloat(t.amount).toLocaleString('id-ID')}`, tableLeft + columnWidths[0] + 5, rowY + 5, { width: columnWidths[1] - 10, align: 'right' })
                   .text(t.type, tableLeft + columnWidths[0] + columnWidths[1] + 5, rowY + 5, { width: columnWidths[2] - 10, align: 'center' })
                   .text(new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }), tableLeft + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5, rowY + 5, { width: columnWidths[3] - 10 })
                   .text(t.Category.name, tableLeft + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + 5, rowY + 5, { width: columnWidths[4] - 10 });

                // Garis horizontal
                doc.moveTo(tableLeft, rowY + rowHeight)
                   .lineTo(tableLeft + columnWidths.reduce((a, b) => a + b), rowY + rowHeight)
                   .stroke('#d3d3d3');
            });

            // Garis vertikal tabel
            let x = tableLeft;
            for (let i = 0; i <= columnWidths.length; i++) {
                doc.moveTo(x, tableTop)
                   .lineTo(x, y + (transactions.length * rowHeight))
                   .stroke('#d3d3d3');
                x += columnWidths[i] || 0;
            }

            // Footer
            doc.moveDown(2);
            doc.fontSize(8)
               .fillColor('#4e5f8b')
               .text(`Diekspor pada: ${new Date().toLocaleString('id-ID')} | © 2025 Budgetin`, 50, doc.page.height - 50, { align: 'center' });

            // Selesai dan kirim dokumen
            doc.end();
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    static async addTransaction(req, res) {
        try {
            let category = await Category.findAll();
            res.render('addTransaction.ejs', { category, errors: {} });
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
            res.redirect(`/dashboard?success=${successMessage}`);
        } catch (error) {
            const category = await Category.findAll();
            let errors = {};
            if (error.errors) {
                error.errors.forEach(err => {
                    errors[err.path] = err.message;
                });
            } else {
                errors.general = error.message;
            }
            res.render('addTransaction.ejs', { category, errors });
        }
    }

    static async editTransaction(req, res) {
        try {
            const { id } = req.params;
            const transaction = await Transaction.findByPk(id, { include: Category });
            const categories = await Category.findAll();
            res.render('editTransaction.ejs', { transaction, categories, errors: {} });
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
            res.redirect(`/dashboard?success=${successMessage}`);
        } catch (error) {
            const transaction = await Transaction.findByPk(req.params.id, { include: Category });
            const categories = await Category.findAll();
            let errors = {};
            if (error.errors) {
                error.errors.forEach(err => {
                    errors[err.path] = err.message;
                });
            } else {
                errors.general = error.message;
            }
            res.render('editTransaction.ejs', { transaction, categories, errors });
        }
    }

    static async deleteTransaction(req, res) {
        try {
            const { id } = req.params;
            await Transaction.destroy({ where: { id } });
            const deleteMessage = encodeURIComponent('Transaksi berhasil dihapus');
            res.redirect(`/dashboard?success=${deleteMessage}`);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Controller;