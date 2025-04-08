const Controller = require('../controllers/controller.js')
const UserController = require('../controllers/userController.js')
const router = require('express').Router()

//get register
router.get('/register', UserController.registerForm)
//post register
router.post('/register', UserController.postRegister)
//get login
router.get('/login', UserController.loginForm)
//post login
router.post('/login', UserController.postLogin)




router.get('/', Controller.home)


module.exports = router