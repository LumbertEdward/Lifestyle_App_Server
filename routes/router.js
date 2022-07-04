var express = require('express');
const { 
    La_Create_Bible_verse_Controller, 
    La_Update_Bible_Verse_Controller, 
    La_Delete_Bible_Verse_Information_Controller,
    La_Get_All_Bible_Verses_Controller
} = require('../controllers/BibleVersesController.js/BibleVersesController');
const { 
    La_Create_Daily_Quotes_Controller, 
    La_Update_Daily_Quotes_Controller, 
    La_Delete_Daily_Quote_Controller,
    La_Get_All_Quotes_Controller
} = require('../controllers/DailyQuotesController/DailyQuotesController');
const { 
    La_Create_Devotional_Controller,
    La_Update_Devotional_Controller,
    La_Delete_Devotional_Controller,
    La_Add_Devotional_Title_Controller,
    La_Add_Devotional_Title_Verses_Controller,
    La_Add_Devotional_Title_Content_Controller,
    La_Update_Devotional_Title_Controller,
    La_Get_Devotionals_Topics_Controller,
    La_Get_Devotional_Topic_Titles_Controller,
    La_Get_Devotional_Title_Content_Controller,
    La_Update_Devotional_Title_Content_Controller
 } = require('../controllers/DevotionalsController/DevotionalController');
const { 
    La_Create_Meal_Plan_Controller, 
    La_Update_Meal_Plan_Controller,
    La_Delete_Meal_Plan_Controller,
    La_Add_Meal_Controller,
    La_Update_Meal_Controller,
    La_Delete_Meal_Controller,
    La_Add_Meal_Category_Controller,
    La_Update_Meal_Category_Controller,
    La_Delete_Meal_Category_Controller,
    La_Update_Category_Type_Controller,
    La_Delete_Category_Type_Controller,
    La_Add_Category_Type_Controller
 } = require('../controllers/MealPlansControllers/MealPlanController');
const { 
    La_Create_Poems_Controller, 
    La_Update_Poem_Controller, 
    La_Delete_Poem_Controller,
    La_Get_All_Poems_Controller,
    La_Get_Poem_By_Id_Controller,
    La_Get_Poem_By_Topic_Controller,
    La_Get_Poem_By_Author_Controller
} = require('../controllers/PoemsController/PoemsController');
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
    La_user_pin_reset_controller,
    La_user_email_reset_code_controller,
    La_user_resend_reset_code_controller,
    La_user_reset_code_verification_controller,
    La_user_set_new_password_controller,
    La_user_phone_set_pin_controller,
    La_user_pin_resend_reset_verification_controller,
    La_user_pin_reset_code_verification_controller,
    La_user_login_information_controller,
    La_user_phone_login_verification_code_controller,
    La_user_phone_resend_login_verification_code_controller,
    La_user_phone_set_new_pin_controller,
    La_user_unlock_pin_information_controller,
    La_user_update_profile_information_controller,
    La_user_update_health_information_controller,
    La_user_update_address_information_controller,
    La_user_log_out_controller,
    La_mobile_refresh_token_information_controller,
    La_user_get_account_information_controller
} = require('../controllers/UserManagementControllers/UserAuthenticationController');

var router = express.Router();

//user authentication

router.post('/la_create_user_information', La_create_user_account_controller)

router.post('/la_user_account_verification_information/:la_user_account_verification_code', La_user_account_verification_code_controller)

router.post('/la_resend_user_verification_code', La_user_account_resend_verification_code_controller)

router.post('/la_user_email_reset_code', La_user_email_reset_code_controller)

router.post('/la_resend_reset_code', La_user_resend_reset_code_controller)

router.post('/la_user_reset_code_verification/:la_user_account_reset_code', La_user_reset_code_verification_controller)

router.post('/la_user_set_new_password', La_user_set_new_password_controller)

router.post('/la_phone_user_set_pin', La_user_phone_set_pin_controller)

router.post('/la_user_pin_reset', La_user_pin_reset_controller)

router.post('/la_user_pin_resend_reset_code', La_user_pin_resend_reset_verification_controller)

router.post('/la_user_pin_reset_code_verification/:la_user_account_pin_reset_code', La_user_pin_reset_code_verification_controller)

router.post('/la_user_set_new_pin', La_user_phone_set_new_pin_controller)

router.patch('/la_user_update_profile_information', La_user_update_profile_information_controller)

router.patch('/la_user_update_address_information', La_user_update_address_information_controller)

router.patch('/la_user_update_health_information', La_user_update_health_information_controller)

router.post('/la_user_login_information', La_user_login_information_controller)

router.post('/la_user_phone_login_verification_code/:la_user_verification_code', La_user_phone_login_verification_code_controller)

router.post('/la_user_phone_login_resend_verification_code/:la_user_phone_number', La_user_phone_resend_login_verification_code_controller)

router.post('/la_user_unlock_pin_information/:la_user_id', La_user_unlock_pin_information_controller)

router.post('/la_user_log_out/:la_user_id', La_user_log_out_controller)

router.post('/la_mobile_refresh_token_information/:la_refresh_token', La_mobile_refresh_token_information_controller)

router.get('/la_user_get_account_information', La_user_get_account_information_controller)

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

router.patch('/la_client_update_account_information', La_Client_Update_Profile_Information_Controller)

router.patch('/la_client_create_address_information', La_Create_Client_Address_Information_Controller)

//poems

router.post('/la_create_poem_information', La_Create_Poems_Controller)

router.patch('/la_update_poem_information/:la_poems_id', La_Update_Poem_Controller)

router.delete('/la_delete_poem_information/:la_poems_id', La_Delete_Poem_Controller)

router.get('/la_get_all_poems_information', La_Get_All_Poems_Controller)

router.get('/la_get_poem_information_by_id/:la_poem_id', La_Get_Poem_By_Id_Controller)

router.get('/la_get_poems_information_by_topic/:la_poem_topic', La_Get_Poem_By_Topic_Controller)

router.get('/la_get_poems_information_by_author/:la_poem_author', La_Get_Poem_By_Author_Controller)

//bible verses

router.post('/la_create_bible_verses_information', La_Create_Bible_verse_Controller)

router.patch('/la_update_bible_verses_information/:la_bible_verse_id', La_Update_Bible_Verse_Controller)

router.delete('/la_delete_bible_verses_information/:la_bible_verse_id', La_Delete_Bible_Verse_Information_Controller)

router.get('/la_get_all_bible_verses_information', La_Get_All_Bible_Verses_Controller)

//daily quotes

router.post('/la_create_daily_quotes_information', La_Create_Daily_Quotes_Controller)

router.patch('/la_update_daily_quotes_information/:la_daily_quotes_id', La_Update_Daily_Quotes_Controller)

router.delete('/la_delete_daily_quotes_information/:la_daily_quotes_id', La_Delete_Daily_Quote_Controller)

router.get('/la_get_all_quotes_information', La_Get_All_Quotes_Controller)

//meal plans

router.post('/la_create_meal_plans_information', La_Create_Meal_Plan_Controller)

router.patch('/la_update_meal_plans_information/:la_meal_plan_id', La_Update_Meal_Plan_Controller)

router.delete('/la_delete_meal_plans_information/:la_meal_plan_id', La_Delete_Meal_Plan_Controller)

router.post('/la_add_meal_plan_meals_information/:la_meal_plan_id', La_Add_Meal_Controller)

router.patch('/la_update_meal_plan_meals_information/:la_meal_plan_meals_id', La_Update_Meal_Controller)

router.delete('/la_delete_meal_plan_meals_information/:la_meal_plan_meals_id', La_Delete_Meal_Controller)

router.post('/la_create_meal_category_information/:la_meal_id', La_Add_Meal_Category_Controller)

router.patch('/la_update_meal_category_information/:la_meal_plan_meals_category_id', La_Update_Meal_Category_Controller)

router.delete('/la_delete_meal_category_information/:la_meal_plan_meals_category_id', La_Delete_Meal_Category_Controller)

router.post('/la_add_category_type_information/:la_meal_plan_meals_category_id', La_Add_Category_Type_Controller)

router.patch('/la_update_category_type_information/:la_meal_plan_meals_category_type_id', La_Update_Category_Type_Controller)

router.delete('/la_delete_category_type_information/:la_meal_plan_meals_category_type_id', La_Delete_Category_Type_Controller)

//devotionals

router.post('/la_create_devotional_information', La_Create_Devotional_Controller)

router.patch('/la_update_devotional_information/:la_devotionals_id', La_Update_Devotional_Controller)

router.delete('/la_delete_devotional_information/:la_devotionals_id', La_Delete_Devotional_Controller)

router.post('/la_add_devotional_title_information/:la_devotionals_id', La_Add_Devotional_Title_Controller)

router.post('/la_add_devotional_title_verses_information/:la_devotionals_titles_id', La_Add_Devotional_Title_Verses_Controller)

router.post('/la_add_devotional_title_content_information/:la_devotionals_titles_id', La_Add_Devotional_Title_Content_Controller)

router.patch('/la_update_devotional_title_information/:la_devotional_title_id', La_Update_Devotional_Title_Controller)

router.patch('/la_update_devotional_title_content_information/:la_devotionals_title_id', La_Update_Devotional_Title_Content_Controller)

router.get('/la_get_devotional_topics_information', La_Get_Devotionals_Topics_Controller)

router.get('/la_get_devotional_topic_titles_information/:la_devotionals_topic_id', La_Get_Devotional_Topic_Titles_Controller)

router.get('/la_get_devotional_title_content_information/:la_devotionals_title_id', La_Get_Devotional_Title_Content_Controller)

module.exports = router;