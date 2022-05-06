var express = require('express');
const { 
    La_create_Client_Account_Information_Controller,
    La_Client_Account_Verification_Controller,
    La_Client_Resend_Verification_Code_Controller,
    La_Client_Reset_Code_Controller,
    La_Client_Resend_Reset_Code_Controller,
    La_Client_Reset_Code_Verification_Controller,
    La_Client_Update_Password_Controller,
    La_Client_Create_Pin_Controller,
    La_Client_Login_Controller,
    La_Client_Unlock_Pin_Controller,
    La_Client_Logout_Controller,
    La_Client_Refresh_Token_Controller,
    La_Client_Update_Profile_Information_Controller,
    La_Create_Client_Address_Information_Controller
 } = require('../controllers/UserManagementControllers/ClientAuthenticationController');
const { 
    La_create_user_account_controller, 
    La_user_account_verification_code_controller, 
    La_user_account_resend_verification_code_controller, 
    La_user_phone_reset_code_controller,
    La_user_email_reset_code_controller,
    La_user_resend_reset_code_controller,
    La_user_reset_code_verification_controller,
    La_user_set_new_password_controller,
    La_user_phone_set_pin_controller,
    La_user_login_information_controller,
    La_user_update_profile_information_controller,
    La_user_update_health_information_controller,
    La_user_update_address_information_controller,
    La_user_log_out_controller,
    La_mobile_refresh_token_information_controller
} = require('../controllers/UserManagementControllers/UserAuthenticationController');

var router = express.Router();

//user authentication

router.post('/la_create_user_information', La_create_user_account_controller)

router.post('/la_user_account_verification_information/:la_user_account_verification_code', La_user_account_verification_code_controller)

router.post('/la_resend_user_verification_code', La_user_account_resend_verification_code_controller)

router.post('/la_user_phone_reset_code', La_user_phone_reset_code_controller)

router.post('/la_user_email_reset_code', La_user_email_reset_code_controller)

router.post('/la_resend_reset_code', La_user_resend_reset_code_controller)

router.post('/la_user_reset_code_verification/:la_user_account_reset_code', La_user_reset_code_verification_controller)

router.post('/la_user_set_new_password', La_user_set_new_password_controller)

router.post('/la_phone_user_set_pin', La_user_phone_set_pin_controller)

router.patch('/la_user_update_profile_information', La_user_update_profile_information_controller)

router.patch('/la_user_update_address_information', La_user_update_address_information_controller)

router.patch('/la_user_update_health_information', La_user_update_health_information_controller)

router.post('/la_user_login_information', La_user_login_information_controller)

router.post('/la_user_log_out/:la_user_id', La_user_log_out_controller)

router.post('/la_mobile_refresh_token_information/:la_refresh_token', La_mobile_refresh_token_information_controller)

//client authentication

router.post('/la_client_create_account_information', La_create_Client_Account_Information_Controller)

router.post('/la_client_account_verification_information/:la_verification_code', La_Client_Account_Verification_Controller)

router.post('/la_client_resend_verification_code', La_Client_Resend_Verification_Code_Controller)

router.post('/la_client_reset_code', La_Client_Reset_Code_Controller)

router.post('/la_client_resend_reset_code', La_Client_Resend_Reset_Code_Controller)

router.post('/la_client_reset_code_verification/:la_client_id', La_Client_Reset_Code_Verification_Controller)

router.patch('/la_client_update_password_information', La_Client_Update_Password_Controller)

router.post('/la_client_create_pin_information', La_Client_Create_Pin_Controller)

router.post('/la_client_login_information', La_Client_Login_Controller)

router.post('/la_client_unlock_pin_information/:la_client_id', La_Client_Unlock_Pin_Controller)

router.post('/la_client_log_out_information/:la_refresh_token', La_Client_Logout_Controller)

router.post('/la_client_refresh_information/:la_refresh_token', La_Client_Refresh_Token_Controller)

router.update('/la_client_update_account_information', La_Client_Update_Profile_Information_Controller)

router.update('/la_client_create_address_information', La_Create_Client_Address_Information_Controller)

module.exports = router;