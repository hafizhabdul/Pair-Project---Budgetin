const Controller = require('../controllers/controller.js')
const UserController = require('../controllers/userController.js')
const { isLoggedIn, isAdmin, userName } = require('../middlewares/auth.js')
const router = require('express').Router()

router.get('/register', UserController.registerForm)
router.post('/register', UserController.postRegister)
router.get('/login', UserController.loginForm)
router.post('/login', UserController.postLogin)




//middleware
router.use(isLoggedIn);
// router.use(isAdmin);
router.use(userName);


router.get('/logout', UserController.getLogout)
router.get('/', Controller.home)
router.get('/transaction/add', Controller.addTransaction)
router.post('/transaction/add', Controller.postTransaction)
router.get('/transaction/edit/:id', Controller.editTransaction);
router.post('/transaction/edit/:id', Controller.postEditTransaction);
router.get('/transaction/delete/:id', Controller.deleteTransaction);

router.get('/categories', Controller.categoryList);
router.post('/categories/add', Controller.addCategory);


module.exports = router