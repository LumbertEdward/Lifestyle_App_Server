const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const otpGenerator = require('otp-generator');
const La_user_account_information_model = require('../../models/UserManagementModels/la_user_account_information_model');
const La_token_information = require('../../models/TokenInformation/la_token_information_model')

//comment

require('dotenv').config();

const credentials = {
    apiKey: process.env.AFRICASTALKING_API_KEY,
    username: process.env.AFRICASTALKING_USERNAME
}

const africastalking = require('africastalking')(credentials)
const sms = africastalking.SMS;

exports.La_create_user_account_controller = async function (req, res, next) {
    const { la_user_email_address, la_user_phone_number, la_user_password, la_sign_up_with } = req.body;
    try {
        if (la_sign_up_with == "la_phone_number") {
            const errors = [];
            if (validator.isEmpty(la_user_phone_number)) {
                errors.push({ message: "Enter a valid phone number" })
            }

            if (errors.length > 0) {
                const error = new Error("Invalid input");
                error.data = errors;
                error.code = 400;
                throw error;
            }

            const currentUser = await La_user_account_information_model.findOne({ la_user_phone_number: la_user_phone_number });

            if (currentUser) {
                const error = new Error("Phone number already in use")
                error.code = 401;
                throw error;
            }

            const one_time_password = otpGenerator.generate(4,
                {
                    specialChars: false,
                    upperCaseAlphabets: false,
                    lowerCaseAlphabets: false,
                    digits: true
                }
            );

            const smsData = {
                to: la_user_phone_number,
                message: ("Your Lifehub App One Time Password is").concat(" ", one_time_password),
                enqueue: true
            }

            // sms.send(smsData);

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
                one_time_password: one_time_password
            })
        }
        else {
            const errors = []
            if (!validator.isEmail(la_user_email_address)) {
                errors.push({ message: "Enter a valid email address" })
            }

            if (validator.isEmpty(la_user_password) || !validator.isLength(la_user_password, { min: 8 })) {
                errors.push({ message: "Enter a valid password" })
            }

            if (errors.length > 0) {
                const error = new Error('Invalid input');
                error.data = errors;
                error.code = 400;
                throw error;
            }

            const currentUser = await La_user_account_information_model.findOne({ la_user_email_address: la_user_email_address });

            if (currentUser) {
                const error = new Error('Email address already in use');
                error.code = 400;
                throw error;
            }

            const one_time_password = otpGenerator.generate(4, {
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                digits: true,
                specialChars: false
            })

            const hashedPassword = await bcrypt.hash(la_user_password, 12);

            const userInformation = new La_user_account_information_model({
                la_user_email_address: la_user_email_address,
                la_user_phone_number: la_user_phone_number,
                la_user_account_verification_code: one_time_password,
                la_user_account_information_type: false,
                la_user_account_password: hashedPassword,
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

exports.La_user_account_verification_code_controller = async function (req, res, next) {
    const { la_user_account_verification_code } = req.params;
    try {
        const errors = [];
        if (validator.isEmpty(la_user_account_verification_code)) {
            errors.push({ message: "Enter a valid one time password" })
        }

        if (errors.length > 0) {
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

        if (!verificationCode) {
            const error = new Error("Invalid one time password, check code and try again");
            error.code = 400;
            throw error;
        }

        verificationCode.la_user_account_information_is_verified = true;
        verificationCode.la_user_account_verification_code_expiry_date = undefined;
        verificationCode.la_user_account_verification_code = undefined;
        verificationCode.la_user_account_information_updated_at = Date.now();

        const updatedUser = await verificationCode.save()

        const accessToken = jwt.sign({
            userId: updatedUser._id.toString(),
            la_user_email_address: updatedUser.la_user_email_address
        },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "30m" }
        );

        const refreshToken = jwt.sign({
            userId: updatedUser._id.toString(),
            la_user_email_address: updatedUser.la_user_email_address
        },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "30d" }
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
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_user_account_resend_verification_code_controller = async function (req, res, next) {
    const { la_user_email_address, la_user_phone_number, la_resend_via } = req.body;
    try {
        if (la_resend_via === "la_phone_number") {
            const errors = []
            if (validator.isEmpty(la_user_phone_number)) {
                errors.push({ message: "Enter a valid phone number" })
            }

            if (errors.length > 0) {
                const error = new Error("Invalid input");
                error.data = errors;
                error.code = 400;
                throw error;
            }

            const userInformation = await La_user_account_information_model.findOne({
                la_user_phone_number: la_user_phone_number
            })

            if (!userInformation) {
                const error = new Error("Phone number not found");
                error.code = 404;
                throw error;
            }

            const one_time_password = otpGenerator.generate(4, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                digits: true,
                specialChars: false
            })

            const smsData = {
                to: userInformation.la_user_phone_number,
                message: ("Your Lifehub App One Time Password is").concat(" ", one_time_password),
                enqueue: true,
            }

            // sms.send(smsData)

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
        else {
            const errors = []
            if (!validator.isEmail(la_user_email_address)) {
                errors.push({ message: "Enter a valid email address" })
            }

            if (errors.length > 0) {
                const error = new Error("Invalid input");
                error.data = errors;
                error.code = 400;
                throw error;
            }

            const userInformation = await La_user_account_information_model.findOne({
                la_user_email_address: la_user_email_address
            })

            if (!userInformation) {
                const error = new Error("Email address not found");
                error.code = 404;
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
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_user_pin_reset_controller = async function (req, res, next) {
    const { la_user_phone_number } = req.body;
    try {
        const errors = []
        if (validator.isEmpty(la_user_phone_number)) {
            errors.push({ message: "Enter a valid phone number" })
        }

        if (errors.length > 0) {
            const error = new Error("Invalid input");
            error.data = errors;
            error.code = 400;
            throw error;
        }

        const currentAccount = await La_user_account_information_model.findOne({
            la_user_phone_number: la_user_phone_number
        })

        if (!currentAccount) {
            const error = new Error("Phone number not found");
            error.code = 404;
            throw error;
        }

        const one_time_password = otpGenerator.generate(4, {
            specialChars: false,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            digits: true
        })

        const smsData = {
            to: currentAccount.la_user_phone_number,
            message: ("Your Lifehub App One Time Password is").concat(" ", one_time_password),
            enqueue: true,
        }

        // sms.send(smsData)

        currentAccount.la_user_account_pin_reset_code = one_time_password;
        currentAccount.la_user_account_pin_reset_code_expiry_date = Date.now() + 3600000;
        currentAccount.la_user_account_information_updated_at = Date.now();

        const updatedUser = await currentAccount.save()

        res.status(200).json({
            status: 200,
            message: "Reset code sent successfully",
            _id: updatedUser._id.toString(),
            la_user_phone_number: updatedUser.la_user_phone_number,
            la_user_account_pin_reset_code: updatedUser.la_user_account_pin_reset_code
        })


    } catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_user_pin_resend_reset_verification_controller = async function (req, res, next) {
    const { la_user_phone_number } = req.body;
    try {
        const errors = []
        if (validator.isEmpty(la_user_phone_number)) {
            errors.push({ message: "Enter a valid phone number" })
        }

        if (errors.length > 0) {
            const error = new Error("Invalid input");
            error.data = errors;
            error.code = 400;
            throw error;
        }

        const currentAccount = await La_user_account_information_model.findOne({
            la_user_phone_number: la_user_phone_number
        })

        if (!currentAccount) {
            const error = new Error("Phone number not found");
            error.code = 404;
            throw error;
        }

        const one_time_password = otpGenerator.generate(4, {
            specialChars: false,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            digits: true
        })

        const smsData = {
            to: userInformation.la_user_phone_number,
            message: ("Your Lifehub App One Time Password is").concat(" ", one_time_password),
            enqueue: true,
        }

        // sms.send(smsData)

        currentAccount.la_user_account_pin_reset_code = one_time_password;
        currentAccount.la_user_account_pin_reset_code_expiry_date = Date.now() + 3600000;
        currentAccount.la_user_account_information_updated_at = Date.now();

        const updatedUser = await currentAccount.save()

        res.status(200).json({
            status: 200,
            message: "Reset code sent successfully",
            _id: updatedUser._id.toString(),
            la_user_phone_number: updatedUser.la_user_phone_number,
            la_user_account_pin_reset_code: updatedUser.la_user_account_pin_reset_code
        })


    } catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_user_pin_reset_code_verification_controller = async function (req, res, next) {
    const { la_user_account_pin_reset_code } = req.params;
    try {
        const errors = []
        if (validator.isEmpty(la_user_account_pin_reset_code)) {
            errors.push({ message: "Enter a valid reset code" })
        }

        if (errors.length > 0) {
            const error = new Error("Invalid input");
            error.data = errors;
            error.code = 400;
            throw error;
        }

        const accountInformation = await La_user_account_information_model.findOne({
            la_user_account_pin_reset_code: la_user_account_pin_reset_code,
            la_user_account_pin_reset_code_expiry_date: {
                $gte: Date.now()
            }
        })

        if (!accountInformation) {
            const error = new Error("Reset code not found");
            error.code = 404;
            throw error;
        }

        accountInformation.la_user_account_pin_reset_code = undefined;
        accountInformation.la_user_account_pin_reset_code_expiry_date = undefined;
        accountInformation.la_user_account_information_updated_at = Date.now();

        const userInformation = await accountInformation.save()

        const accessToken = jwt.sign({
            userId: userInformation._id.toString(),
            la_user_phone_number: userInformation.la_user_phone_number,
            la_user_email_address: userInformation.la_user_email_address,
        },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "30m" });

        const refreshToken = jwt.sign({
            userId: userInformation._id.toString(),
            la_user_phone_number: userInformation.la_user_phone_number
        },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "30d" });

        await new La_token_information({
            la_refresh_token: refreshToken,
            la_user_id: userInformation._id.toString(),
        }).save()

        res.status(200).json({
            status: 200,
            message: "Pin reset code verified successfully",
            _id: userInformation._id.toString(),
            accessToken: accessToken,
            refreshToken: refreshToken
        })
    }
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_user_phone_set_new_pin_controller = async function (req, res, next) {
    const { la_user_pin } = req.body;
    try {
        if (!req.isAuth) {
            const error = new Error("Unauthorised access, Login to continue");
            error.code = 401;
            throw error;
        }

        const userInformation = await La_user_account_information_model.findById(req.userId)

        if (!userInformation) {
            const error = new Error("User not found")
            error.code = 404;
            throw error;
        }

        const newPin = await bcrypt.hash(la_user_pin, 12);

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
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_user_email_reset_code_controller = async function (req, res, next) {
    const { la_user_email_address } = req.body;
    try {
        const errors = []
        if (!validator.isEmail(la_user_email_address)) {
            errors.push({ message: "Enter a valid email address" })
        }

        if (errors.length > 0) {
            const error = new Error("Invalid input");
            error.data = errors;
            error.code = 400;
            throw error;
        }

        const currentAccount = await La_user_account_information_model.findOne({
            la_user_email_address: la_user_email_address
        })

        if (!currentAccount) {
            const error = new Error("Email address not found");
            error.code = 404;
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

exports.La_user_resend_reset_code_controller = async function (req, res, next) {
    const { la_user_email_address, la_user_phone_number, la_resend_with } = req.body;

    try {
        if (la_resend_with === "la_phone_number") {
            const errors = []
            if (validator.isEmpty(la_user_phone_number)) {
                errors.push({ message: "Enter a valid phone number" })
            }

            if (errors.length > 0) {
                const error = new Error("Invalid input");
                error.data = errors;
                error.code = 400;
                throw error;
            }

            const userInformation = await La_user_account_information_model.findOne({
                la_user_phone_number: la_user_phone_number
            })

            if (!userInformation) {
                const error = new Error("Phone number not found");
                error.code = 404;
                throw error;
            }

            const one_time_password = otpGenerator.generate(4, {
                specialChars: false,
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                digits: true
            })

            const smsData = {
                to: userInformation.la_user_phone_number,
                message: ("Your Lifehub App One Time Password is").concat(" ", one_time_password),
                enqueue: true,
            }

            // sms.send(smsData)

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
        else {
            const errors = []
            if (validator.isEmail(la_user_email_address)) {
                errors.push({ message: "Enter a valid email address" })
            }

            if (errors.length > 0) {
                const error = new Error("Invalid input");
                error.data = errors;
                error.code = 400;
                throw error;
            }

            const userInformation = await La_user_account_information_model.findOne({
                la_user_email_address: la_user_email_address
            })

            if (!userInformation) {
                const error = new Error("Email address not found");
                error.code = 404;
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
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_user_reset_code_verification_controller = async function (req, res, next) {
    const { la_user_account_reset_code } = req.params;
    try {
        const errors = []
        if (validator.isEmpty(la_user_account_reset_code)) {
            errors.push({ message: "Enter a valid one time password" })
        }

        if (errors.length > 0) {
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

        if (!resetCode) {
            const error = new Error("Invalid one time password, check code and try again");
            error.code = 404;
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
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "30m" }
        );

        const refreshToken = jwt.sign({
            userId: updatedUser._id.toString(),
            la_user_email_address: updatedUser.la_user_email_address
        },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "30d" }
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
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_user_set_new_password_controller = async function (req, res, next) {
    const { la_new_password } = req.body;
    try {
        if (!req.isAuth) {
            const error = new Error("Unauthorised access, Login to continue");
            error.code = 401;
            throw error;
        }

        const userInformation = await La_user_account_information_model.findById(req.userId)

        if (!userInformation) {
            const error = new Error("User not found");
            error.code = 404;
            throw error;
        }

        const newPassword = await bcrypt.hash(la_new_password, 12);

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
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_user_phone_set_pin_controller = async function (req, res, next) {
    const { la_user_pin } = req.body;
    try {
        if (!req.isAuth) {
            const error = new Error("Unauthorised access, Login to continue");
            error.code = 401;
            throw error;
        }

        const userInformation = await La_user_account_information_model.findById(req.userId)

        if (!userInformation) {
            const error = new Error("User not found")
            error.code = 404;
            throw error;
        }

        const newPin = await bcrypt.hash(la_user_pin, 12);

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
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_user_login_information_controller = async function (req, res, next) {
    const { la_user_email_address, la_user_phone_number, la_user_password, la_user_login_with } = req.body;
    try {
        if (la_user_login_with === "la_phone_number") {
            const errors = []
            if (validator.isEmpty(la_user_phone_number)) {
                errors.push({ message: "Enter a valid phone number" })
            }

            if (errors.length > 0) {
                const error = new Error("Invalid input");
                error.data = errors;
                error.code = 400;
                throw error;
            }

            const userInformation = await La_user_account_information_model.findOne({
                la_user_phone_number: la_user_phone_number
            })

            if (!userInformation) {
                const error = new Error("Phone number does no exist");
                error.code = 400;
                throw error;
            }


            if (userInformation.la_user_account_information_is_verified == false) {
                const error = new Error("Account not verified");
                error.code = 401;
                throw error;
            }

            const one_time_password = otpGenerator.generate(4,
                {
                    upperCaseAlphabets: false,
                    lowerCaseAlphabets: false,
                    digits: true,
                    specialChars: false,
                }
            )

            const smsData = {
                to: userInformation.la_user_phone_number,
                message: ("Your Lifehub App One Time Password is").concat(" ", one_time_password),
                enqueue: true,
            }

            // sms.send(smsData)

            userInformation.la_user_account_verification_code = one_time_password;
            userInformation.la_user_account_verification_code_expiry_date = Date.now() + 360000;
            userInformation.la_user_account_information_updated_at = Date.now();
            await userInformation.save()

            res.status(200).json({
                status: 200,
                message: "Login successful",
                _id: userInformation._id.toString(),
                one_time_password: one_time_password
            })
        }
        else {
            const errors = []
            if (!validator.isEmail(la_user_email_address)) {
                errors.push({ message: "Enter a valid email address" })
            }

            if (validator.isEmpty(la_user_password)) {
                errors.push({ message: "Enter a valid password" })
            }

            if (errors.length > 0) {
                const error = new Error("Invalid input");
                error.data = errors;
                error.code = 400;
                throw error;
            }

            const userInformation = await La_user_account_information_model.findOne({
                la_user_email_address: la_user_email_address
            })

            if (!userInformation) {
                const error = new Error("Email address does not exist");
                error.code = 404;
                throw error;
            }

            var status = await bcrypt.compare(la_user_password, userInformation.la_user_account_password)

            if (!status) {
                const error = new Error("Wrong email or password");
                error.code = 400;
                throw error;
            }

            if (userInformation.la_user_account_information_is_verified == false) {
                const error = new Error("Account not verified");
                error.code = 401;
                throw error;
            }

            const accessToken = jwt.sign({
                userId: userInformation._id.toString(),
                la_user_phone_number: userInformation.la_user_phone_number,
                la_user_email_address: userInformation.la_user_email_address,
            },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "30m" });

            const refreshToken = jwt.sign({
                userId: userInformation._id.toString(),
                la_user_phone_number: userInformation.la_user_phone_number
            },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: "30d" });

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

exports.La_user_phone_login_verification_code_controller = async function (req, res, next) {
    const { la_user_verification_code } = req.params;
    try {
        const errors = []
        if (validator.isEmpty(la_user_verification_code)) {
            errors.push({ message: "Enter a valid verification code" })
        }

        if (errors.length > 0) {
            const error = new Error("Invalid input");
            error.data = errors;
            error.code = 400;
            throw error;
        }

        const userInformation = await La_user_account_information_model.findOne({
            la_user_account_verification_code: la_user_verification_code,
            la_user_account_verification_code_expiry_date: {
                $gte: Date.now()
            }
        })

        if (!userInformation) {
            const error = new Error("Verification code does not exist");
            error.code = 404;
            throw error;
        }

        if (userInformation.la_user_account_information_is_verified !== true) {
            const error = new Error("Account not verified");
            error.code = 401;
            throw error;
        }

        userInformation.la_user_account_verification_code = undefined;
        userInformation.la_user_account_verification_code_expiry_date = undefined;
        userInformation.la_user_account_information_updated_at = Date.now();
        const updatedUser = await userInformation.save()

        const accessToken = jwt.sign({
            userId: updatedUser._id.toString(),
            la_user_email_address: updatedUser.la_user_email_address
        },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "30m" }
        );

        const refreshToken = jwt.sign({
            userId: updatedUser._id.toString(),
            la_user_email_address: updatedUser.la_user_email_address
        },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "30d" }
        );

        await new La_token_information({
            la_refresh_token: refreshToken,
            la_user_id: updatedUser._id.toString(),
        }).save()

        res.status(200).json({
            status: 200,
            message: "Login successful",
            _id: updatedUser._id.toString(),
            token: accessToken,
            refreshToken: refreshToken
        })
    }
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_user_phone_resend_login_verification_code_controller = async function (req, res, next) {
    const { la_user_phone_number } = req.params;
    try {
        const errors = []
        if (validator.isEmpty(la_user_phone_number)) {
            errors.push({ message: "Enter a valid phone number" })
        }

        if (errors.length > 0) {
            const error = new Error("Invalid input");
            error.data = errors;
            error.code = 400;
            throw error;
        }

        const userInformation = await La_user_account_information_model.findOne({
            la_user_phone_number: la_user_phone_number
        })

        if (!userInformation) {
            const error = new Error("Phone number does no exist");
            error.code = 400;
            throw error;
        }


        if (userInformation.la_user_account_information_is_verified === false) {
            const error = new Error("Account not verified");
            error.code = 401;
            throw error;
        }

        const one_time_password = otpGenerator.generate(4,
            {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                digits: true,
                specialChars: false,
            }
        )

        const smsData = {
            to: userInformation.la_user_phone_number,
            message: ("Your Lifehub App One Time Password is").concat(" ", one_time_password),
            enqueue: true,
        }

        // sms.send(smsData)

        userInformation.la_user_account_verification_code = one_time_password;
        userInformation.la_user_account_verification_code_expiry_date = Date.now() + 360000;
        userInformation.la_user_account_information_updated_at = Date.now();
        await userInformation.save()

        res.status(200).json({
            status: 200,
            message: "Code sent",
            _id: userInformation._id.toString(),
            one_time_password: one_time_password
        })
    }
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_user_unlock_pin_information_controller = async function (req, res, next) {
    const { la_user_account_pin } = req.body;
    const { la_user_id } = req.params;
    try {
        const errors = []
        if (validator.isEmpty(la_user_account_pin)) {
            errors.push({ message: "Enter a valid pin" })
        }

        if (errors.length > 0) {
            const error = new Error("Invalid input");
            error.data = errors;
            error.code = 400;
            throw error;
        }

        const userInformation = await La_user_account_information_model.findOne({
            _id: la_user_id
        })

        if (!userInformation) {
            const error = new Error("User does no exist");
            error.code = 400;
            throw error;
        }

        const userPhonePin = await bcrypt.compare(la_user_account_pin, userInformation.la_user_account_pin)

        if (!userPhonePin) {
            const error = new Error("Invalid pin");
            error.code = 400;
            throw error;
        }

        if (userInformation.la_user_account_information_is_verified == false) {
            const error = new Error("Account not verified");
            error.code = 401;
            throw error;
        }

        const accessToken = jwt.sign({
            userId: userInformation._id.toString(),
            la_user_phone_number: userInformation.la_user_phone_number,
            la_user_email_address: userInformation.la_user_email_address,
        },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "30m" });

        const refreshToken = jwt.sign({
            userId: userInformation._id.toString(),
            la_user_phone_number: userInformation.la_user_phone_number
        },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "30d" });

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
    } catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_user_update_profile_information_controller = async function (req, res, next) {
    const {
        la_user_account_information_type,
        la_user_first_name,
        la_user_middle_name,
        la_user_last_name,
        la_user_gender,
        la_user_date_of_birth,
        la_user_username,
        la_user_identification_type,
        la_user_identification_number,
        la_user_identification_country_of_issue,
    } = req.body;

    try {
        if (!req.isAuth) {
            const error = new Error("Unauthorised access, Login to continue");
            error.code = 401;
            throw error;
        }

        const userInformation = await La_user_account_information_model.findById(req.userId)

        if (!userInformation) {
            const error = new Error("User not found")
            error.code = 404;
            throw error;
        }

        if (la_user_account_information_type !== undefined) {
            userInformation.la_user_account_information_type = la_user_account_information_type;
        }
        if (la_user_first_name !== undefined) {
            userInformation.la_user_first_name = la_user_first_name;
        }
        if (la_user_middle_name !== undefined) {
            userInformation.la_user_middle_name = la_user_middle_name;
        }
        if (la_user_last_name !== undefined) {
            userInformation.la_user_last_name = la_user_last_name;
        }
        if (la_user_username !== undefined) {
            userInformation.la_user_username = la_user_username;
        }
        if (la_user_username !== undefined) {
            userInformation.la_user_username = la_user_username;
        }
        if (la_user_gender !== undefined) {
            userInformation.la_user_gender = la_user_gender;
        }
        if (la_user_date_of_birth !== undefined) {
            userInformation.la_user_date_of_birth = la_user_date_of_birth;
        }
        if (la_user_identification_type !== undefined) {
            userInformation.la_user_identification_type = la_user_identification_type;
        }
        if (la_user_identification_number !== undefined) {
            userInformation.la_user_identification_number = la_user_identification_number;
        }
        if (la_user_identification_country_of_issue !== undefined) {
            userInformation.la_user_identification_country_of_issue = la_user_identification_country_of_issue;
        }

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
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }

}

exports.La_user_update_health_information_controller = async function (req, res, next) {
    const {
        la_user_diet_type,
        la_user_health_condition,
        la_user_disabled_or_having_health_condition,
        la_user_disability_or_health_condition_details,
        la_user_number_of_eat_times,
        la_user_meal_taken_details
    } = req.body;

    try {
        if (!req.isAuth) {
            const error = new Error("Unauthorised access, Login to continue");
            error.code = 401;
            throw error;
        }

        const userInformation = await La_user_account_information_model.findById(req.userId)

        if (!userInformation) {
            const error = new Error("User not found")
            error.code = 404;
            throw error;
        }

        if (la_user_diet_type !== undefined) {
            userInformation.la_user_diet_type = la_user_diet_type;
        }
        if (la_user_health_condition !== undefined) {
            userInformation.la_user_current_health_condition = la_user_health_condition;
        }
        if (la_user_disabled_or_having_health_condition !== undefined) {
            userInformation.la_user_is_disabled_or_having_a_health_condition = la_user_disabled_or_having_health_condition;
        }
        if (la_user_disability_or_health_condition_details !== undefined) {
            userInformation.la_user_disability_or_health_condition_details = la_user_disability_or_health_condition_details;
        }
        if (la_user_number_of_eat_times !== undefined) {
            userInformation.la_user_number_of_eat_times = la_user_number_of_eat_times;
        }
        if (la_user_meal_taken_details !== undefined) {
            userInformation.la_user_meal_taken_details.concat(la_user_meal_taken_details);
        }

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
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }

}

exports.La_user_update_address_information_controller = async function (req, res, next) {
    const {
        la_user_country,
        la_user_city,
        la_user_state,
        la_user_postal_code,
        la_user_address_line_1,
        la_user_address_line_2,

    } = req.body;

    try {
        if (!req.isAuth) {
            const error = new Error("Unauthorised access, Login to continue");
            error.code = 401;
            throw error;
        }

        const userInformation = await La_user_account_information_model.findById(req.userId)

        if (!userInformation) {
            const error = new Error("User not found")
            error.code = 404;
            throw error;
        }

        userInformation.la_user_address_information = {
            la_user_country: la_user_country,
            la_user_city: la_user_city,
            la_user_state: la_user_state,
            la_user_postal_code: la_user_postal_code,
            la_user_address_line_one: la_user_address_line_1,
            la_user_address_line_two: la_user_address_line_2,
        }

        userInformation.la_user_account_information_updated_at = Date.now();

        const updatedUser = await userInformation.save();

        res.status(200).json({
            status: 200,
            message: "Address information updated successfully",
            _id: updatedUser._id.toString(),
            la_user_profile_information: updatedUser,
            la_user_account_information_created_at: updatedUser.la_user_account_information_created_at,
            la_user_account_information_updated_at: updatedUser.la_user_account_information_updated_at,
            la_user_account_information_is_verified: updatedUser.la_user_account_information_is_verified,
        })
    }
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_user_get_account_information_controller = async function(req, res, next){
    try{
        if(!req.isAuth){
            const error = new Error("Unauthorised access, login to continue")
            error.code = 401
            throw error
        }

        const userInformation = await La_user_account_information_model.findById(req.userId)

        if (!userInformation) {
            const error = new Error("User not found")
            error.code = 404;
            throw error;
        }

        res.status(200).json({
            status: 200,
            message: "Account information retrieved successfully",
            ...userInformation
        })
    }
    catch(error){
        res.json({message: error.message, status: error.code})
        next()
    }
}

exports.La_user_log_out_controller = async function (req, res, next) {
    const { la_refresh_token } = req.body;
    const { la_user_id } = req.params;

    try {
        if (validator.isEmpty(la_refresh_token)) {
            const error = new Error("Refresh token is required");
            error.code = 400;
            throw error;
        }

        const refreshToken = await La_token_information.findOne({
            la_refresh_token: la_refresh_token,
            la_user_id: la_user_id
        });

        if (!refreshToken) {
            const error = new Error("Refresh token not found");
            error.code = 404;
            throw error;
        }

        await La_token_information.findOneAndDelete({
            la_refresh_token: la_refresh_token
        })

        res.status(200).json({
            status: 200,
            message: "Logged out successfully",
        })
    }
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_mobile_refresh_token_information_controller = async function (req, res, next) {
    const { la_refresh_token } = req.params;

    try {
        if (validator.isEmpty(la_refresh_token)) {
            const error = new Error("Refresh token is required");
            error.code = 400;
            throw error;
        }

        const refreshToken = await La_token_information.findOne({
            la_refresh_token: la_refresh_token
        })

        if (!refreshToken) {
            const error = new Error("Refresh token not found");
            error.code = 404;
            throw error;
        }

        const payload = jwt.verify(refreshToken.la_refresh_token,
            process.env.REFRESH_TOKEN_SECRET,
        );

        const accessToken = jwt.sign({
            userId: payload.userId
        },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "30m" })

        res.status(200).json({
            status: 200,
            message: "Token generated successfully",
            token: accessToken,
            refreshToken: refreshToken.la_refresh_token,
            userId: refreshToken.la_user_id,
        })

    } catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}
