const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const otpGenerator = require('otp-generator');
const La_clients_account_information_model = require('../../models/UserManagementModels/la_clients_account_information_model');
const La_Clients_Devotional_Model = require('../../models/DevotionalsModels/la_clients_devotional_model');

exports.La_Create_Devotional_Controller = async function (req, res, next) {
    const { 
        

     } = req.body;
}