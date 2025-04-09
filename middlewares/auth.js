const { User } = require('../models')


const isLoggedIn = function (req, res, next) {
    // console.log('Session:', req.session);
    if (!req.session.userId) {
        const error = 'Please login first!'
        res.redirect(`/login?error=${error}`)
    } else {
        next()
    }
}
const isAdmin = function (req, res, next) {
    // console.log('Session:', req.session);
    if (req.session.userId && req.session.role !== 'user') {
        const error = 'You Have no acces!'
        res.redirect(`/login?error=${error}`)
    } else {
        next()
    }
}

const userName = async function (req, res, next) {
    try {
        if (req.session.userId) {
            const user = await User.findByPk(req.session.userId);
            res.locals.user = user;
        } else {
            res.locals.user = null;
        }
        next();
    } catch (error) {
        console.error('Error in userName middleware:', error);
        res.locals.user = null;
        next();
    }
};

module.exports = { isLoggedIn, isAdmin, userName }