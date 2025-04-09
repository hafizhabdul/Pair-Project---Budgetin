const { User } = require('../models')
const bcrypt = require('bcryptjs')
class UserController {
    static async registerForm(req, res) {
        try {
            res.render('register.ejs')
        } catch (error) {
            res.send(error)
        }
    }
    static async postRegister(req, res) {
        try {
            const { name, email, password, role } = req.body
            await User.create({ name, email, password, role })
            res.redirect('/login')
        } catch (error) {
            res.send(error)
        }
    }
    static async loginForm(req, res) {
        try {
            const { error } = req.query
            res.render('login.ejs', { error })
        } catch (error) {
            res.send(error)
        }
    }
    static async postLogin(req, res) {
        try {
            const { email, password } = req.body;
            let user = await User.findOne({ where: { email } });
            if (user) {
                const isValidPassword = await bcrypt.compare(password, user.password);
                if (isValidPassword) {
                    req.session.userId = user.id; // Pastikan ini disetel
                    req.session.role = user.role;
                    return res.redirect('/');
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
    static async getLogout(req,res){
        try {
            req.session.destroy((err)=>{
                if (err) res.send(err);
                else {
                    res.redirect('/login')
                }
            })
        } catch (error) {
            res.send(error)
        }
    }
}

module.exports = UserController