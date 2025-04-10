const Controller = require('../controllers/controller.js');
const UserController = require('../controllers/userController.js');
const { isLoggedIn, isAdmin, userName } = require('../middlewares/auth.js');
const router = require('express').Router();

router.get('/', Controller.landingPage);

router.get('/register', UserController.registerForm);
router.post('/register', UserController.postRegister);
router.get('/login', UserController.loginForm);
router.post('/login', UserController.postLogin);

router.use(isLoggedIn);
// router.use(isAdmin);
router.use(userName);

router.get('/logout', UserController.getLogout);
router.get('/dashboard', Controller.home);
router.get('/dashboard/export/csv', Controller.exportToCSV); 
router.get('/dashboard/export/pdf', Controller.exportToPDF); 
router.get('/transaction/add', Controller.addTransaction);
router.post('/transaction/add', Controller.postTransaction);
router.get('/transaction/edit/:id', Controller.editTransaction);
router.post('/transaction/edit/:id', Controller.postEditTransaction);
router.get('/transaction/delete/:id', Controller.deleteTransaction);

router.get('/profile', UserController.profileForm);
router.post('/profile', UserController.updateProfile);

module.exports = router;