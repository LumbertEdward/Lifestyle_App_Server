var express = require('express');
const { LoginController, CreateUserController } = require('../controllers/UserManagementControllers/UserAuthenticationController');
var router = express.Router();

router.post('/la_create_user_information', CreateUserController)

router.post('/la_user_login_information', LoginController)

module.exports = router;