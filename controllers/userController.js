const { User } = require('../models');
const bcrypt = require('bcryptjs');

class UserController {
    static async registerForm(req, res) {
        try {
            res.render('register.ejs', { error: null, name: '', email: '' });
        } catch (error) {
            res.send(error);
        }
    }

    static async postRegister(req, res) {
        try {
            const { name, email, password, confirmPassword } = req.body;

            if (password !== confirmPassword) {
                return res.render('register.ejs', { 
                    error: 'Password dan konfirmasi password tidak cocok!', 
                    name, 
                    email 
                });
            }

            await User.create({ name, email, password, role: 'user' });
            res.redirect('/login');
        } catch (error) {
            let errorMessage = 'Terjadi kesalahan saat registrasi.';
            if (error.name === 'SequelizeUniqueConstraintError') {
                errorMessage = 'Email sudah digunakan, silakan gunakan email lain!';
            } else if (error.name === 'SequelizeValidationError') {
                errorMessage = error.errors.map(err => err.message).join(', ');
            }
            res.render('register.ejs', { 
                error: errorMessage, 
                name: req.body.name || '', 
                email: req.body.email || '' 
            });
        }
    }

    static async loginForm(req, res) {
        try {
            const { error } = req.query;
            res.render('login.ejs', { error });
        } catch (error) {
            res.send(error);
        }
    }

    static async postLogin(req, res) {
        try {
            const { email, password } = req.body;
            let user = await User.findOne({ where: { email } });
            if (user) {
                const isValidPassword = await bcrypt.compare(password, user.password);
                if (isValidPassword) {
                    req.session.userId = user.id;
                    req.session.role = user.role;
                    return res.redirect('/dashboard');
                } else {
                    const error = 'Invalid email/password';
                    return res.redirect(`/login?error=${error}`);
                }
            } else {
                const error = 'Invalid email/password';
                return res.redirect(`/login?error=${error}`);
            }
        } catch (error) {
            res.send(error);
        }
    }

    static async getLogout(req, res) {
        try {
            req.session.destroy((err) => {
                if (err) res.send(err);
                else {
                    res.redirect('/login');
                }
            });
        } catch (error) {
            res.send(error);
        }
    }

    static async profileForm(req, res) {
        try {
            const userId = req.session.userId;
            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error('Pengguna tidak ditemukan');
            }
            res.render('profile.ejs', { user });
        } catch (error) {
            res.send(error);
        }
    }

    static async updateProfile(req, res) {
        try {
            const userId = req.session.userId;
            const { name, email, password } = req.body;

            const updatedData = { name, email };
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                updatedData.password = hashedPassword;
            }

            await User.update(updatedData, { where: { id: userId } });
            const successMessage = encodeURIComponent('Profil berhasil diperbarui');
            res.redirect(`/dashboard?success=${successMessage}`);
        } catch (error) {
            const user = await User.findByPk(req.session.userId);
            res.render('profile.ejs', { user, error: error.message });
        }
    }
}

module.exports = UserController;