const Controller = require('../controllers/controller.js');
const UserController = require('../controllers/userController.js');
const { isLoggedIn, isAdmin, userName } = require('../middlewares/auth.js');
const router = require('express').Router();

// Rute untuk landing page (sebelum middleware isLoggedIn)
router.get('/', Controller.landingPage);

// Rute untuk register dan login
router.get('/register', UserController.registerForm);
router.post('/register', UserController.postRegister);
router.get('/login', UserController.loginForm);
router.post('/login', UserController.postLogin);

// Middleware
router.use(isLoggedIn);
// router.use(isAdmin);
router.use(userName);

// Rute lainnya (setelah middleware isLoggedIn)
router.get('/logout', UserController.getLogout);
router.get('/dashboard', Controller.home); // Pindahkan rute dashboard ke sini
router.get('/transaction/add', Controller.addTransaction);
router.post('/transaction/add', Controller.postTransaction);
router.get('/transaction/edit/:id', Controller.editTransaction);
router.post('/transaction/edit/:id', Controller.postEditTransaction);
router.get('/transaction/delete/:id', Controller.deleteTransaction);

// Rute profil (dari implementasi sebelumnya)
router.get('/profile', UserController.profileForm);
router.post('/profile', UserController.updateProfile);

module.exports = router;