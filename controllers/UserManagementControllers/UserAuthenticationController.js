const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator');
const La_user_account_information_model = require('../models/UserManagementModels/la_user_account_information_model');
const La_user_address_information = require('../models/UserManagementModels/la_user_address_information_model');
const La_token_information = require('../models/UserManagementModels/la_token_information_model');

const credentials = {
    apiKey: "",
    username: ""
}
const africastalking = require('africastalking')(credentials)
const sms = africastalking.SMS;

exports.CreateUserController = async function(req, res, next){
    const { la_user_email_address, la_user_phone_number, la_user_password, la_sign_up_with } = req.body;
    try {
        if(la_sign_up_with === "la_phone_number"){
            const errors = [];
            if(validator.isEmpty(la_user_phone_number)){
                errors.push({message: "Enter a valid phone number"})
            }

            if(errors.length > 0){
                const error = new Error("Invalid input");
                error.data = errors;
                error.code = 400;
                throw error;
            }

            const currentUser = await La_user_account_information_model.findOne({la_user_phone_number: la_user_phone_number});
            if (currentUser) {
                const error = new Error("Phone number already in use")
                error.code = 400;
                error.data = errors;
                throw error;
            }

            const one_time_password = otpGenerator.generate(4, 
                { 
                    specialChars: false, 
                    upperCaseAlphabets: false ,
                    lowerCaseAlphabets: false,
                    digits: true
                }
            );

            const userInformation = new La_user_account_information_model({
                la_user_phone_number: la_user_phone_number,
                la_user_email_address: la_user_email_address,
                la_user_account_verification_code: one_time_password,
                la_user_account_verification_code_expiry_date: Date.now() + 3600000,
                la_user_account_information_created_at: Date.now(),
                la_user_account_information_updated_at: Date.now()
            })

            const createdAccount = await userInformation.save();

            return res.status(200).json({
                status: 200,
                message: "Account created successfully",
                _id: createdAccount._id,
                la_user_phone_number: createdAccount.la_user_phone_number,
                la_user_email: createdAccount.la_user_email_address,
                la_user_account_verification_code: createdAccount.la_user_account_verification_code,
                la_user_account_information_created_at: createdAccount.la_user_account_information_created_at,
                la_user_account_information_updated_at: createdAccount.la_user_account_information_updated_at,
                la_user_account_information_is_verified: createdAccount.la_user_account_information_is_verified,
                la_user_account_information_is_locked: createdAccount.la_user_account_information_is_locked,
            })
        }
        else{
            const errors = []
            if(!validator.isEmail(la_user_email_address)){
                errors.push({message: "Enter a valid email address"})
            }

            if(errors.length > 0){
                const error = new Error('Invalid input');
                error.data = errors;
                error.code = 400;
                throw error;
            }

            const currentUser = await La_user_account_information_model.findOne({la_user_email_address: la_user_email_address});

            if(currentUser){
                const error = new Error('Email address already in use');
                error.code = 400;
                error.data = errors;
                throw error;
            }

            const one_time_password = otpGenerator.generate(4, {
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                digits: true,
                specialChars: false
            })

            const userInformation = new La_user_account_information_model({
                la_user_email_address: la_user_email_address,
                la_user_phone_number: la_user_phone_number,
                la_user_account_verification_code: one_time_password,
                la_user_account_password: bcrypt.hash(la_user_password, 12),
                la_user_account_verification_code_expiry_date: Date.now() + 3600000,
                la_user_account_information_created_at: Date.now(),
                la_user_account_information_updated_at: Date.now()
            })

            const createdAccount = await userInformation.save();

            return res.status(200).json({
                status: 200,
                message: "Account created successfully",
                _id: createdAccount._id,
                la_user_phone_number: createdAccount.la_user_phone_number,
                la_user_email: createdAccount.la_user_email_address,
                la_user_account_verification_code: createdAccount.la_user_account_verification_code,
                la_user_account_information_created_at: createdAccount.la_user_account_information_created_at,
                la_user_account_information_updated_at: createdAccount.la_user_account_information_updated_at,
                la_user_account_information_is_verified: createdAccount.la_user_account_information_is_verified,
                la_user_account_information_is_locked: createdAccount.la_user_account_information_is_locked,

            })
        }
        
    } catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.AccountVerification = async function (req, res, next) {
    const { la_user_account_verification_code } = req.params;
    try {
        const errors = [];
        if(validator.isEmpty(la_user_account_verification_code)){
            errors.push({message: "Enter a valid one time password"})
        }

        if(errors.length > 0){
            const error = new Error("Invalid input");
            error.data = errors;
            error.code = 400;
            throw error;
        }

        const verificationCode = await La_user_account_information_model.findOne({
            la_user_account_verification_code: la_user_account_verification_code,
            la_user_account_verification_code_expiry_date: {
                $gte: Date.now()
            }
        });

        if(!verificationCode){
            const error = new Error("Invalid one time password, check code and try again");
            error.code = 400;
            error.data = errors;
            throw error;
        }

        verificationCode.la_user_account_information_is_verified = true;
        verificationCode.la_user_account_verification_code_expiry_date = undefined;
        verificationCode.la_user_account_verification_code = undefined;
        verificationCode.la_user_account_information_updated_at = Date.now();

        const updatedUser = verificationCode.save()

        const accessToken = jwt.sign({
            userId: updatedUser._id.toString(),
            la_user_email_address: updatedUser.la_user_email_address
        },
        "thisisalifestyleappthathelpsclientsmanagehowtheyliveappropriately",
        {expiresIn: "30m"}
        );

        const refreshToken = jwt.sign({
            userId: updatedUser._id.toString(),
            la_user_email_address: updatedUser.la_user_email_address
        },
        "YW1qdXN0c29tZXdoZXJldHlpbmd0b21ha2VtaXN0YWtlc2xpZmVpc2Z1bGxvZnN0cnVnZ2xlc2hlcmU",
        {expiresIn: "30d"}
        );

        await new La_token_information({
            la_refresh_token: refreshToken,
            la_user_id: updatedUser._id.toString(),
        }).save()

        return res.status(200).json({
            status: 200,
            message: "Account verified successfully",
            _id: updatedUser._id.toString(),
            token: accessToken,
            refreshToken: refreshToken
        })
    }
    catch(error){
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.AccountResendVerificationCode = async function (req, res, next) {
    const { la_user_email_address, la_user_phone_number, la_resend_via } = req.body;
    try{
        if(la_resend_via === "la_phone_number"){
            const errors = []
            if(validator.isEmpty(la_user_phone_number)){
                errors.push({message: "Enter a valid phone number"})
            }

            if(errors.length > 0){
                const error = new Error("Invalid input");
                error.data = errors;
                error.code = 400;
                throw error;
            }

            const userInformation = await La_user_account_information_model.findOne({
                la_user_phone_number: la_user_phone_number
            })

            if(!userInformation){
                const error = new Error("Phone number not found");
                error.code = 400;
                error.data = errors;
                throw error;
            }

            const one_time_password = otpGenerator.generate(4, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                digits: true,
                specialChars: false
            })

            userInformation.la_user_account_verification_code = one_time_password;
            userInformation.la_user_account_verification_code_expiry_date = Date.now() + 3600000;
            userInformation.la_user_account_information_updated_at = Date.now();

            const updatedInformation = await userInformation.save();

            res.status(200).json({
                status: 200,
                message: "Verification code sent successfully",
                _id: updatedInformation._id,
                la_user_phone_number: updatedInformation.la_user_phone_number,
                la_user_email: updatedInformation.la_user_email_address,    
                la_user_account_verification_code: updatedInformation.la_user_account_verification_code,

            })
        }
        else{
            const errors = []
            if(!validator.isEmail(la_user_email_address)){
                errors.push({message: "Enter a valid email address"})
            }

            if(errors.length > 0){
                const error = new Error("Invalid input");
                error.data = errors;
                error.code = 400;
                throw error;
            }

            const userInformation = await La_user_account_information_model.findOne({
                la_user_email_address: la_user_email_address
            })

            if(!userInformation){
                const error = new Error("Email address not found");
                error.code = 400;
                error.data = errors;
                throw error;
            }

            const one_time_password = otpGenerator.generate(4, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                digits: true,
                specialChars: false
            })

            userInformation.la_user_account_verification_code = one_time_password;
            userInformation.la_user_account_verification_code_expiry_date = Date.now() + 3600000;
            userInformation.la_user_account_information_updated_at = Date.now();

            const updatedInformation = await userInformation.save();

            res.status(200).json({
                status: 200,
                message: "Verification code sent successfully",
                _id: updatedInformation._id,
                la_user_phone_number: updatedInformation.la_user_phone_number,
                la_user_email: updatedInformation.la_user_email_address,    
                la_user_account_verification_code: updatedInformation.la_user_account_verification_code,
                
            })

        }
    }
    catch(error){
        res.json({message: error.message, status: error.code})
        next()
    }
}

exports.AccountPhoneResetCode = async function (req, res, next) {
    const { la_user_phone_number } = req.body;
    try {
        const errors = []
        if(validator.isEmpty(la_user_phone_number)){
            errors.push({message: "Enter a valid phone number"})
        }

        if(errors.length > 0){
            const error = new Error("Invalid input");
            error.data = errors;
            error.code = 400;
            throw error;
        }

        const currentAccount = await La_user_account_information_model.findOne({
            la_user_phone_number: la_user_phone_number
        })

        if(!currentAccount){
            const error = new Error("Phone number not found");
            error.data = errors;
            error.code = 400;
            throw error;
        }

        const one_time_password = otpGenerator.generate(4, {
            specialChars: false,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            digits: true
        })

        currentAccount.la_user_account_reset_code = one_time_password;
        currentAccount.la_user_account_reset_code_expiry_date = Date.now() + 3600000;
        currentAccount.la_user_account_information_updated_at = Date.now();

        const updatedUser = await currentAccount.save()

        res.status(200).json({
            status: 200,
            message: "Reset code sent successfully",
            _id: updatedUser._id.toString(),
            la_user_phone_number: updatedUser.la_user_phone_number,
            la_user_account_reset_code: updatedUser.la_user_account_reset_code,
            la_user_account_reset_code_expiry_date: updatedUser.la_user_account_reset_code_expiry_date,
            la_user_account_information_created_at: updatedUser.la_user_account_information_created_at,
            la_user_account_information_updated_at: updatedUser.la_user_account_information_updated_at,
            la_user_account_information_is_verified: updatedUser.la_user_account_information_is_verified,
            la_user_account_information_is_locked: updatedUser.la_user_account_information_is_locked,
        })


    } catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.AccountEmailResetCode = async function (req, res, next) {
    const { la_user_email_address } = req.body;
    try {
        const errors = []
        if(!validator.isEmail(la_user_email_address)){
            errors.push({message: "Enter a valid email address"})
        }

        if(errors.length > 0){
            const error = new Error("Invalid input");
            error.data = errors;
            error.code = 400;
            throw error;
        }

        const currentAccount = await La_user_account_information_model.findOne({
            la_user_email_address: la_user_email_address
        })

        if(!currentAccount){
            const error = new Error("Email address not found");
            error.data = errors;
            error.code = 400;
            throw error;
        }

        const one_time_password = otpGenerator.generate(4, {
            specialChars: false,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            digits: true
        })

        currentAccount.la_user_account_reset_code = one_time_password;
        currentAccount.la_user_account_reset_code_expiry_date = Date.now() + 3600000;
        currentAccount.la_user_account_information_updated_at = Date.now();

        const updatedUser = await currentAccount.save()

        res.status(200).json({
            status: 200,
            message: "Reset code sent successfully",
            _id: updatedUser._id.toString(),
            la_user_email_address: updatedUser.la_user_email_address,
            la_user_account_reset_code: updatedUser.la_user_account_reset_code,
            la_user_account_information_created_at: updatedUser.la_user_account_information_created_at,
            la_user_account_information_updated_at: updatedUser.la_user_account_information_updated_at,
            la_user_account_information_is_verified: updatedUser.la_user_account_information_is_verified,
            la_user_account_information_is_locked: updatedUser.la_user_account_information_is_locked,
        })


    } catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.AccountResendResetCode = async function (req, res, next) {
    const { la_user_email_address, la_user_phone_number, la_resend_with } = req.body;

    try{
        if(la_resend_with === "la_phone_number"){
            const errors = []
            if(validator.isEmpty(la_user_phone_number)){
                errors.push({message: "Enter a valid phone number"})
            }

            if(errors.length > 0){
                const error = new Error("Invalid input");
                error.data = errors;
                error.code = 400;
                throw error;
            }

            const userInformation = await La_user_account_information_model.findOne({
                la_user_phone_number: la_user_phone_number
            })

            if(!userInformation){
                const error = new Error("Phone number not found");
                error.data = errors;
                error.code = 400;
                throw error;
            }

            const one_time_password = otpGenerator.generate(4, {
                specialChars: false,
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                digits: true
            })

            userInformation.la_user_account_reset_code = one_time_password;
            userInformation.la_user_account_reset_code_expiry_date = Date.now() + 3600000;
            userInformation.la_user_account_information_updated_at = Date.now();

            const updatedUser = await userInformation.save()

            res.status(200).json({
                status: 200,
                message: "Reset code sent successfully",
                _id: updatedUser._id.toString(),
                la_user_phone_number: updatedUser.la_user_phone_number,
                la_user_account_reset_code: updatedUser.la_user_account_reset_code,
                la_user_account_information_created_at: updatedUser.la_user_account_information_created_at,
                la_user_account_information_updated_at: updatedUser.la_user_account_information_updated_at,
                la_user_account_information_is_verified: updatedUser.la_user_account_information_is_verified,
            })
        }
        else{
            const errors = []
            if(validator.isEmail(la_user_email_address)){
                errors.push({message: "Enter a valid email address"})
            }

            if(errors.length > 0){
                const error = new Error("Invalid input");
                error.data = errors;
                error.code = 400;
                throw error;
            }

            const userInformation = await La_user_account_information_model.findOne({
                la_user_email_address: la_user_email_address
            })

            if(!userInformation){
                const error = new Error("Email address not found");
                error.data = errors;
                error.code = 400;
                throw error;
            }

            const one_time_password = otpGenerator.generate(4, {
                specialChars: false,
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                digits: true
            })

            userInformation.la_user_account_reset_code = one_time_password;
            userInformation.la_user_account_reset_code_expiry_date = Date.now() + 3600000;
            userInformation.la_user_account_information_updated_at = Date.now();

            const updatedUser = await userInformation.save()

            res.status(200).json({
                status: 200,
                message: "Reset code sent successfully",
                _id: updatedUser._id.toString(),
                la_user_email_address: updatedUser.la_user_email_address,
                la_user_account_reset_code: updatedUser.la_user_account_reset_code,
                la_user_account_information_created_at: updatedUser.la_user_account_information_created_at,
                la_user_account_information_updated_at: updatedUser.la_user_account_information_updated_at,
                la_user_account_information_is_verified: updatedUser.la_user_account_information_is_verified,
            })

        }
    }
    catch(error){
        res.json({message: error.message, status: error.code})
        next()
    }
}

exports.AccountResetCodeVerification = async function (req, res, next) {
    const { la_user_account_reset_code } = req.params;
    try {
        const errors = []
        if(validator.isEmpty(la_user_account_reset_code)){
            errors.push({message: "Enter a valid one time password"})
        }

        if(errors.length > 0){
            const error = new Error("Invalid input");
            error.data = errors;
            error.code = 400;
            throw error;
        }

        const resetCode = await La_user_account_information_model.findOne({
            la_user_account_reset_code: la_user_account_reset_code,
            la_user_account_reset_code_expiry_date: {
                $gte: Date.now()
            }
        })

        if(!resetCode){
            const error = new Error("Invalid one time password, check code and try again");
            error.code = 400;
            error.data = errors;
            throw error;
        }

        resetCode.la_user_account_reset_code_expiry_date = undefined;
        resetCode.la_user_account_reset_code = undefined;
        resetCode.la_user_account_information_is_verified = true;
        resetCode.la_user_account_information_updated_at = Date.now();

        const updatedUser = await resetCode.save()

        const accessToken = jwt.sign({
            userId: updatedUser._id.toString(),
            la_user_email_address: updatedUser.la_user_email_address
        },
        "thisisalifestyleappthathelpsclientsmanagehowtheyliveappropriately",
        {expiresIn: "30m"}
        );

        const refreshToken = jwt.sign({
            userId: updatedUser._id.toString(),
            la_user_email_address: updatedUser.la_user_email_address
        },
        "YW1qdXN0c29tZXdoZXJldHlpbmd0b21ha2VtaXN0YWtlc2xpZmVpc2Z1bGxvZnN0cnVnZ2xlc2hlcmU",
        {expiresIn: "30d"}
        );

        await new La_token_information({
            la_refresh_token: refreshToken,
            la_user_id: updatedUser._id.toString(),
        }).save()

        res.status(200).json({
            status: 200,
            message: "Reset Code verification successfully",
            _id: updatedUser._id.toString(),
            token: accessToken,
            refreshToken: refreshToken,
            la_user_email_address: updatedUser.la_user_email_address,
            la_user_phone_number: updatedUser.la_user_phone_number,
            la_user_account_information_created_at: updatedUser.la_user_account_information_created_at,
            la_user_account_information_updated_at: updatedUser.la_user_account_information_updated_at,
            la_user_account_information_is_verified: updatedUser.la_user_account_information_is_verified,
        })
    }
    catch(error){
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.AccountSetNewPassword = async function (req, res, next) {
    const { la_new_password } = req.body;
    try{
        if(!req.isAuth){
            const error = new Error("Unauthorised access, Login to continue");
            error.code = 401;
            throw error;
        }

        const userInformation = await La_user_account_information_model.findById(req.userId)

        if(!userInformation){
            const error = new Error("User not found");
            error.code = 404;
            throw error;
        }
        
        const newPassword = bcrypt.hash(la_new_password, 12);

        userInformation.la_user_account_password = newPassword;
        userInformation.la_user_account_information_updated_at = Date.now();

        const updatedUser = await userInformation.save()

        res.status(200).json({
            status: 200,
            message: "Password updated successfully",
            _id: updatedUser._id.toString(),
            la_user_email_address: updatedUser.la_user_email_address,
            la_user_phone_number: updatedUser.la_user_phone_number,
            la_user_account_information_created_at: updatedUser.la_user_account_information_created_at,
            la_user_account_information_updated_at: updatedUser.la_user_account_information_updated_at,
            la_user_account_information_is_verified: updatedUser.la_user_account_information_is_verified,
        })
    }
    catch(error){
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.AccountPhonePin = async function (req, res, next) {
    const { la_user_pin } = req.body;
    try{
        if(!req.isAuth){
            const error = new Error("Unauthorised access, Login to continue");
            error.code = 401;
            throw error;
        }
        
        const userInformation = await La_user_account_information_model.findById(req.userId)

        if(!userInformation){
            const error = new Error("User not found")
            error.code = 404;
            throw error;
        }

        const newPin = bcrypt.hash(la_user_pin, 12);

        userInformation.la_user_account_pin = newPin;
        userInformation.la_user_account_information_updated_at = Date.now();

        const updatedUser = await userInformation.save()

        res.status(200).json({
            status: 200,
            message: "Pin updated successfully",
            _id: updatedUser._id.toString(),
            la_user_email_address: updatedUser.la_user_email_address,
            la_user_phone_number: updatedUser.la_user_phone_number,
            la_user_account_information_created_at: updatedUser.la_user_account_information_created_at,
            la_user_account_information_updated_at: updatedUser.la_user_account_information_updated_at,
            la_user_account_information_is_verified: updatedUser.la_user_account_information_is_verified,

        })
    }
    catch(error){
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.AccountUpdateProfileInformation = async function (req, res, next) {
    const { 
        la_user_first_name,
        la_user_middle_name,
        la_user_last_name,
        la_user_gender,
        la_user_date_of_birth,
        la_user_username,
        la_user_identification_type,
        la_user_identification_number,
        la_user_identification_country_of_issue,
        la_user_diet_type,
        la_user_health_condition,
        la_user_disabled_or_having_health_condition,
        la_user_disability_or_health_condition_details,
        la_user_number_of_eat_times,
        la_user_meal_taken_details
    } = req.body;

    if(!req.isAuth){
        const error = new Error("Unauthorised access, Login to continue");
        error.code = 401;
        throw error;
    }

    const userInformation = await La_user_account_information_model.findById(req.userId)

    if(!userInformation){
        const error = new Error("User not found")
        error.code = 404;
        throw error;
    }

    userInformation.la_user_first_name = la_user_first_name;
    userInformation.la_user_middle_name = la_user_middle_name;
    userInformation.la_user_last_name = la_user_last_name;
    userInformation.la_user_username = la_user_username;
    userInformation.la_user_gender = la_user_gender;
    userInformation.la_user_date_of_birth = la_user_date_of_birth;
    userInformation.la_user_identification_type = la_user_identification_type;
    userInformation.la_user_identification_number = la_user_identification_number;
    userInformation.la_user_identification_country_of_issue = la_user_identification_country_of_issue;
    userInformation.la_user_account_information_updated_at = Date.now();

    const updatedUser = await userInformation.save()

    res.status(200).json({
        status: 200,
        message: "Profile information updated successfully",
        _id: updatedUser._id.toString(),
        la_user_profile_information: updatedUser,
        la_user_account_information_created_at: updatedUser.la_user_account_information_created_at,
        la_user_account_information_updated_at: updatedUser.la_user_account_information_updated_at,
        la_user_account_information_is_verified: updatedUser.la_user_account_information_is_verified,
    })

}

exports.LoginController = async function(req, res, next){
    const { la_user_email_address, la_user_account_pin, la_user_password, la_user_login_with } = req.body;
    try {
        if(la_user_login_with === "la_phone_number"){
            const errors = []
            if(validator.isEmpty(la_user_account_pin)){
                errors.push({message: "Enter a valid pin"})
            }

            if(errors.length > 0){
                const error = new Error("Invalid input");
                error.data = errors;
                error.code = 400;
                throw error;
            }

            const userInformation = await La_user_account_information_model.findOne({
                la_user_account_pin: la_user_account_pin
            })

            if(!userInformation){
                const error = new Error("Invalid pin");
                error.data = errors;
                error.code = 400;
                throw error;
            }

            const accessToken = jwt.sign({
                userId: userInformation._id.toString(),
                la_user_phone_number: userInformation.la_user_phone_number,
                la_user_email_address: userInformation.la_user_email_address,
            },
            "thisisalifestyleappthathelpsclientsmanagehowtheyliveappropriately",
            {expiresIn: "30m"});

            const refreshToken = jwt.sign({
                userId: userInformation._id.toString(),
                la_user_phone_number: userInformation.la_user_phone_number
            },
            "YW1qdXN0c29tZXdoZXJldHlpbmd0b21ha2VtaXN0YWtlc2xpZmVpc2Z1bGxvZnN0cnVnZ2xlc2hlcmU",
            {expiresIn: "30d"});

            await new La_token_information({
                la_refresh_token: refreshToken,
                la_user_id: userInformation._id.toString(),
            }).save()

            res.status(200).json({
                status: 200,
                message: "Login successful",
                _id: userInformation._id.toString(),
                token: accessToken,
                refreshToken: refreshToken
            })
        }
        else{
            const errors = []
            if(!validator.isEmail(la_user_email_address)){
                errors.push({message: "Enter a valid email address"})
            }

            if(errors.length > 0){
                const error = new Error("Invalid input");
                error.data = errors;
                error.code = 400;
                throw error;
            }

            const userInformation = await La_user_account_information_model.findOne({
                la_user_email_address: la_user_email_address
            })

            if(!userInformation){
                const error = new Error("Email address does not exist");
                error.data = errors;
                error.code = 400;
                throw error;
            }

            if(!bcrypt.compare(la_user_password, userInformation.la_user_account_password)){
                const error = new Error("Wrong email or password");
                error.data = errors;
                error.code = 400;
                throw error;
            }

            const accessToken = jwt.sign({
                userId: userInformation._id.toString(),
                la_user_phone_number: userInformation.la_user_phone_number,
                la_user_email_address: userInformation.la_user_email_address,
            },
            "thisisalifestyleappthathelpsclientsmanagehowtheyliveappropriately",
            {expiresIn: "30m"});

            const refreshToken = jwt.sign({
                userId: userInformation._id.toString(),
                la_user_phone_number: userInformation.la_user_phone_number
            },
            "YW1qdXN0c29tZXdoZXJldHlpbmd0b21ha2VtaXN0YWtlc2xpZmVpc2Z1bGxvZnN0cnVnZ2xlc2hlcmU",
            {expiresIn: "30d"});

            await new La_token_information({
                la_refresh_token: refreshToken,
                la_user_id: userInformation._id.toString(),
            }).save()

            res.status(200).json({
                status: 200,
                message: "Login successful",
                _id: userInformation._id.toString(),
                token: accessToken,
                refreshToken: refreshToken
            })
        }

    } catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.AccountUpdateUserHealthInformation = async function (req, res, next) {
    const { 
        la_user_diet_type,
        la_user_health_condition,
        la_user_disabled_or_having_health_condition,
        la_user_disability_or_health_condition_details,
        la_user_number_of_eat_times,
        la_user_meal_taken_details
    } = req.body;

    if(!req.isAuth){
        const error = new Error("Unauthorised access, Login to continue");
        error.code = 401;
        throw error;
    }

    const userInformation = await La_user_account_information_model.findById(req.userId)

    if(!userInformation){
        const error = new Error("User not found")
        error.code = 404;
        throw error;
    }

    userInformation.la_user_diet_type = la_user_diet_type;
    userInformation.la_user_current_health_condition = la_user_health_condition;
    userInformation.la_user_is_disabled_or_having_a_health_condition = la_user_disabled_or_having_health_condition;
    userInformation.la_user_disability_or_health_condition_details = la_user_disability_or_health_condition_details;
    userInformation.la_user_number_of_eat_times = la_user_number_of_eat_times;
    userInformation.la_user_meal_taken_details = la_user_meal_taken_details;
    userInformation.la_user_account_information_updated_at = Date.now();

    const updatedUser = await userInformation.save()

    res.status(200).json({
        status: 200,
        message: "Health information updated successfully",
        _id: updatedUser._id.toString(),
        la_user_profile_information: updatedUser,
        la_user_account_information_created_at: updatedUser.la_user_account_information_created_at,
        la_user_account_information_updated_at: updatedUser.la_user_account_information_updated_at,
        la_user_account_information_is_verified: updatedUser.la_user_account_information_is_verified,
    })

}
