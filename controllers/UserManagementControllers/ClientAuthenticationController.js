const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const otpGenerator = require('otp-generator');
const La_clients_account_information_model = require('../../models/UserManagementModels/la_clients_account_information_model');
const La_token_information = require('../../models/TokenInformation/la_token_information_model');

require('dotenv').config();

const credentials = {
    apiKey: process.env.AFRICASTALKING_API_KEY,
    username: process.env.AFRICASTALKING_USERNAME
}

const africastalking = require('africastalking')(credentials)
const sms = africastalking.SMS;

exports.La_create_Client_Account_Information_Controller = async function (req, res, next) {
    const { la_client_email_address, la_client_phone_number, la_client_password, la_sign_up_with } = req.body;

    try {
        if (la_sign_up_with === "la_email_address") {
            const errors = []
            if (!validator.isEmail(la_client_email_address)) {
                errors.push({ message: "Invalid Email Address" })
            }

            if (validator.isEmpty(la_client_password)) {
                errors.push({ message: "Password is required" })
            }

            if (!validator.isLength(la_client_password, { min: 8 })) {
                errors.push({ message: "Password must be at least 8 characters" })
            }

            if (errors.length > 0) {
                const error = new Error('Invalid Input')
                error.data = errors
                error.code = 400
                throw error
            }

            const userInformation = await La_clients_account_information_model.findOne({
                la_client_email_address: la_client_email_address
            })

            if (userInformation) {
                const error = new Error('Email Address already exists')
                error.code = 401
                throw error
            }

            const one_time_password = otpGenerator.generate(4,
                {
                    upperCaseAlphabets: false,
                    specialChars: false,
                    lowerCaseAlphabets: false,
                    digits: true
                }
            );

            const encrypted_password = await bcrypt.hash(la_client_password, 12)

            const la_client_account_information = new La_clients_account_information_model({
                la_client_email_address: la_client_email_address,
                la_client_password: encrypted_password,
                la_client_verification_code: one_time_password,
                la_client_verification_code_expiry_at: Date.now() + 3600000,
                la_client_created_at: Date.now(),
                la_client_updated_at: Date.now()
            })

            const clientInformation = await la_client_account_information.save()

            res.status(200).json({
                status: 200,
                message: "Account Created Successfully",
                id: clientInformation._id,
                la_client_email_address: clientInformation.la_client_email_address,
                la_client_verification_code: clientInformation.la_client_verification_code,
            })
        }
        else {
            const errors = []
            if (validator.isEmpty(la_client_phone_number)) {
                errors.push({ message: "Phone Number is required" })
            }

            if (errors.length > 0) {
                const error = new Error('Invalid Input')
                error.data = errors
                error.code = 400
                throw error
            }

            const userInformation = await La_clients_account_information_model.findOne({
                la_client_phone_number: la_client_phone_number
            })

            if (userInformation) {
                const error = new Error('Phone Number already exists')
                error.code = 401
                throw error
            }

            const one_time_password = otpGenerator.generate(4,
                {
                    upperCaseAlphabets: false,
                    specialChars: false,
                    lowerCaseAlphabets: false,
                    digits: true
                }
            )

            const smsData = {
                to: la_client_phone_number,
                message: ("Your Fitspiration Contributor App One Time Password is").concat(" ", one_time_password),
                enqueue: true
            }

            sms.send(smsData);

            const clientInformation = new La_clients_account_information_model({
                la_client_phone_number: la_client_phone_number,
                la_client_verification_code: one_time_password,
                la_client_verification_code_expiry_at: Date.now() + 3600000,
                la_client_created_at: Date.now(),
                la_client_updated_at: Date.now()
            })

            res.status(200).json({
                status: 200,
                message: "Account Created Successfully",
                id: clientInformation._id,
                la_client_phone_number: clientInformation.la_client_phone_number,
                la_client_verification_code: clientInformation.la_client_verification_code,
            })
        }

    } catch (error) {
        res.json({ message: error.message, status: error.code });
        next()
    }
}

exports.La_Client_Account_Verification_Controller = async function (req, res, next) {
    const { la_verification_code } = req.params;

    try {
        const errors = []
        if (validator.isEmpty(la_verification_code)) {
            errors.push({ message: "Verification Code is required" })
        }

        if (errors.length > 0) {
            const error = new Error('Invalid Input')
            error.data = errors
            error.code = 400
            throw error
        }

        const checkCode = await La_clients_account_information_model.findOne({
            la_client_verification_code: la_verification_code,
            la_client_verification_code_expiry_at: {
                $gte: Date.now()
            }
        })

        if (!checkCode) {
            const error = new Error('Enter valid verification code')
            error.code = 404
            throw error
        }

        checkCode.la_client_is_verified = true;
        checkCode.la_client_verification_code = undefined;
        checkCode.la_client_verification_code_expiry_at = undefined;
        checkCode.la_client_updated_at = Date.now();

        const updatedClientInformation = await checkCode.save()

        const accessToken = jwt.sign(
            {
                userId: updatedClientInformation._id,
                email: updatedClientInformation.la_client_email_address,
            }, process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '30m' }
        )

        const refreshToken = jwt.sign(
            {
                userId: updatedClientInformation._id,
                email: updatedClientInformation.la_client_email_address,
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '30d' }
        )

        await La_token_information({
            la_user_id: updatedClientInformation._id,
            la_refresh_token: refreshToken,
        }).save()

        res.status(200).json({
            status: 200,
            message: "Account Verified Successfully",
            _id: updatedClientInformation._id,
            token: accessToken,
            refreshToken: refreshToken,
        })


    } catch (error) {
        res.json({ message: error.message, status: error.code });
        next()
    }
}

exports.La_Client_Resend_Verification_Code_Controller = async function (req, res, next) {
    const { la_client_email_address, la_client_phone_number, la_resend_via } = req.body;

    try {
        if (la_resend_via === "la_email_address") {
            const clientInformation = await La_clients_account_information_model.findOne({
                la_client_email_address: la_client_email_address,
            })

            if (!clientInformation) {
                const error = new Error('User not found')
                error.code = 404
                throw error
            }

            const one_time_password = otpGenerator.generate(4,
                {
                    upperCaseAlphabets: false,
                    specialChars: false,
                    lowerCaseAlphabets: false,
                    digits: true
                }
            )

            clientInformation.la_client_verification_code = one_time_password;
            clientInformation.la_client_verification_code_expiry_at = Date.now() + 3600000;
            clientInformation.la_client_updated_at = Date.now();

            const updatedClientInformation = await clientInformation.save()

            res.status(200).json({
                status: 200,
                message: "Verification Code Sent Successfully",
                id: updatedClientInformation._id,
                la_client_verification_code: updatedClientInformation.la_client_verification_code,
            })
        }
        else {
            const clientInformation = await La_clients_account_information_model.findOne({
                la_client_phone_number: la_client_phone_number,
            })

            if (!clientInformation) {
                const error = new Error('User not found')
                error.code = 404
                throw error
            }

            const one_time_password = otpGenerator.generate(4,
                {
                    upperCaseAlphabets: false,
                    specialChars: false,
                    lowerCaseAlphabets: false,
                    digits: true
                }
            )

            const smsData = {
                to: clientInformation.la_client_phone_number,
                message: ("Your Fitspiration Contributor App One Time Password is").concat(" ", one_time_password),
                enqueue: true
            }

            sms.send(smsData)

            clientInformation.la_client_verification_code = one_time_password;
            clientInformation.la_client_verification_code_expiry_at = Date.now() + 3600000;
            clientInformation.la_client_updated_at = Date.now();

            const updatedClientInformation = await clientInformation.save()

            res.status(200).json({
                status: 200,
                message: "Verification Code Sent Successfully",
                id: updatedClientInformation._id,
                la_client_verification_code: updatedClientInformation.la_client_verification_code,
            })

        }
    }
    catch (error) {
        res.json({ message: error.message, status: error.code });
        next()
    }
}

exports.La_Client_Reset_Code_Controller = async function (req, res, next) {
    const { la_client_email_address } = req.body;

    try {
        const errors = [];
            if (!validator.isEmail(la_client_email_address)) {
                errors.push({ message: "Invalid Email Address" })
            }

            if (errors.length > 0) {
                const error = new Error('Invalid Input')
                error.data = errors
                error.code = 400
                throw error
            }

            const clientInformation = await La_clients_account_information_model.findOne({
                la_client_email_address: la_client_email_address,
            })

            if (!clientInformation) {
                const error = new Error('Email Address Not Found')
                error.code = 404
                throw error
            }

            const one_time_password = otpGenerator.generate(4,
                {
                    upperCaseAlphabets: false,
                    specialChars: false,
                    lowerCaseAlphabets: false,
                    digits: true
                }
            )

            clientInformation.la_client_reset_code = one_time_password;
            clientInformation.la_client_reset_code_expiry_at = Date.now() + 3600000;
            clientInformation.la_client_updated_at = Date.now();

            const updatedClientInformation = await clientInformation.save()

            res.status(200).json({
                status: 200,
                message: "Reset Code Sent Successfully",
                id: updatedClientInformation._id,
                la_client_reset_code: updatedClientInformation.la_client_reset_code,
            })
    }
    catch (error) {
        res.json({ message: error.message, status: error.code });
        next()
    }
}

exports.La_Client_Resend_Reset_Code_Controller = async function (req, res, next) {
    const { la_client_email_address, la_client_phone_number, la_resend_with } = req.body;

    try {
        if (la_resend_with === "la_email_address") {
            const clientInformation = await La_clients_account_information_model.findOne({
                la_client_email_address: la_client_email_address,
            })

            if (!clientInformation) {
                const error = new Error('Invalid Client Id')
                error.code = 404
                throw error
            }

            const one_time_password = otpGenerator.generate(4,
                {
                    upperCaseAlphabets: false,
                    specialChars: false,
                    lowerCaseAlphabets: false,
                    digits: true
                }
            )

            clientInformation.la_client_reset_code = one_time_password;
            clientInformation.la_client_reset_code_expiry_at = Date.now() + 3600000;
            clientInformation.la_client_updated_at = Date.now();

            const updatedClientInformation = await clientInformation.save()

            res.status(200).json({
                status: 200,
                message: "Reset Code Sent Successfully",
                id: updatedClientInformation._id,
                la_client_reset_code: updatedClientInformation.la_client_reset_code,
            })
        }
        else {
            const clientInformation = await La_clients_account_information_model.findOne({
                la_client_phone_number: la_client_phone_number,
            })

            if (!clientInformation) {
                const error = new Error('Invalid Client Id')
                error.code = 404
                throw error
            }

            const one_time_password = otpGenerator.generate(4,
                {
                    upperCaseAlphabets: false,
                    specialChars: false,
                    lowerCaseAlphabets: false,
                    digits: true
                }
            )

            const smsData = {
                to: clientInformation.la_client_phone_number,
                message: ("Your Fitspiration Contributor App One Time Password is").concat(" ", one_time_password),
                enqueue: true
            }

            sms.send(smsData)

            clientInformation.la_client_reset_code = one_time_password;
            clientInformation.la_client_reset_code_expiry_at = Date.now() + 3600000;
            clientInformation.la_client_updated_at = Date.now();

            const updatedClientInformation = await clientInformation.save()

            res.status(200).json({
                status: 200,
                message: "Reset Code Sent Successfully",
                id: updatedClientInformation._id,
                la_client_reset_code: updatedClientInformation.la_client_reset_code,
            })

        }
    }
    catch (error) {
        res.json({ message: error.message, status: error.code });
        next()
    }
}

exports.La_Client_Reset_Code_Verification_Controller = async function (req, res, next) {
    const { la_reset_code } = req.params;

    try {
        const errors = []

        if(validator.isEmpty(la_reset_code)){
            errors.push({message: "Invalid code"})
        }

        if(errors.length > 0){
            const error = new Error("Invalid inputs")
            error.data = errors
            error.code = 401
            throw error
        }

        const checkCode = await La_clients_account_information_model.findOne({
            la_client_reset_code: la_reset_code,
            la_client_reset_code_expiry_at: {
                $gte: Date.now()
            }
        })

        if (!checkCode) {
            const error = new Error('Invalid Reset Code')
            error.code = 404
            throw error
        }

        checkCode.la_client_reset_code = undefined;
        checkCode.la_client_reset_code_expiry_at = undefined;
        checkCode.la_client_updated_at = Date.now();

        const updatedClientInformation = await checkCode.save();

        const accessToken = jwt.sign(
            {
                userId: updatedClientInformation._id,
                email: updatedClientInformation.la_client_email_address,
            }, process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '30m' }
        )

        const refreshToken = jwt.sign(
            {
                userId: updatedClientInformation._id,
                email: updatedClientInformation.la_client_email_address,
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '30d' }
        )

        await La_token_information({
            la_user_id: updatedClientInformation._id,
            la_refresh_token: refreshToken,
        }).save()

        res.status(200).json({
            status: 200,
            message: "Reset Code Verified Successfully",
            _id: updatedClientInformation._id,
            token: accessToken,
            refreshToken: refreshToken,
        })

    } catch (error) {
        res.json({ message: error.message, status: error.code });
        next()
    }
}

exports.La_Client_Update_Password_Controller = async function (req, res, next) {
    const { la_client_password } = req.body;

    try {
        if (!req.isAuth) {
            const error = new Error('Unauthorised access, Login to continue')
            error.code = 401
            throw error
        }

        if (validator.isEmpty(la_client_password)) {
            const error = new Error('Invalid Password')
            error.code = 400
            throw error
        }

        const clientInformation = await La_clients_account_information_model.findOne({
            _id: req.userId,
        })

        if (!clientInformation) {
            const error = new Error('Invalid Client Id')
            error.code = 404
            throw error
        }

        const hashedPasword = await bcrypt.hash(la_client_password, 12)

        clientInformation.la_client_password = hashedPasword;
        clientInformation.la_client_updated_at = Date.now();

        const updatedClient = await clientInformation.save();

        res.status(200).json({
            status: 200,
            message: "Password Updated Successfully",
            id: updatedClient._id,
        })


    }
    catch (error) {
        res.json({ message: error.message, status: error.code });
        next()
    }
}

exports.La_Client_Create_Pin_Controller = async function (req, res, next) {
    const { la_client_pin } = req.body;

    try {
        if (!req.isAuth) {
            const error = new Error('Unauthorised access, Login to continue')
            error.code = 401
            throw error
        }

        if (validator.isEmpty(la_client_pin)) {
            const error = new Error('Invalid Pin')
            error.code = 400
            throw error
        }

        const clientInformation = await La_clients_account_information_model.findOne({
            _id: req.userId,
        })

        if (!clientInformation) {
            const error = new Error('Invalid Client Id')
            error.code = 404
            throw error
        }

        const hashedPin = await bcrypt.hash(la_client_pin, 12)

        clientInformation.la_client_account_pin = hashedPin;
        clientInformation.la_client_updated_at = Date.now();

        const updatedClient = await clientInformation.save();

        res.status(200).json({
            status: 200,
            message: "Pin Created Successfully",
            id: updatedClient._id,
        })

    } catch (error) {
        res.json({ message: error.message, status: error.code });
        next()
    }
}

exports.La_Client_pin_reset_controller = async function (req, res, next) {
    const { la_client_phone_number } = req.body;
    try {
        const errors = []
        if (validator.isEmpty(la_client_phone_number)) {
            errors.push({ message: "Enter a valid phone number" })
        }

        if (errors.length > 0) {
            const error = new Error("Invalid input");
            error.data = errors;
            error.code = 400;
            throw error;
        }

        const currentAccount = await La_clients_account_information_model.findOne({
            la_client_phone_number: la_client_phone_number
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
            to: currentAccount.la_client_phone_number,
            message: ("Your Fitspiration App One Time Password is").concat(" ", one_time_password),
            enqueue: true,
        }

        sms.send(smsData)

        currentAccount.la_client_pin_reset_code = one_time_password;
        currentAccount.la_client_pin_reset_code_expiry_date = Date.now() + 3600000;
        currentAccount.la_client_updated_at = Date.now();

        const updatedUser = await currentAccount.save()

        res.status(200).json({
            status: 200,
            message: "Reset code sent successfully",
            _id: updatedUser._id.toString(),
            la_user_phone_number: updatedUser.la_client_phone_number,
            la_user_account_pin_reset_code: updatedUser.la_client_pin_reset_code
        })


    } catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_Client_pin_resend_reset_verification_controller = async function (req, res, next) {
    const { la_client_phone_number } = req.body;
    try {
        const errors = []
        if (validator.isEmpty(la_client_phone_number)) {
            errors.push({ message: "Enter a valid phone number" })
        }

        if (errors.length > 0) {
            const error = new Error("Invalid input");
            error.data = errors;
            error.code = 400;
            throw error;
        }

        const currentAccount = await La_clients_account_information_model.findOne({
            la_client_phone_number: la_client_phone_number
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
            to: userInformation.la_client_phone_number,
            message: ("Your Fitspiration App One Time Password is").concat(" ", one_time_password),
            enqueue: true,
        }

        sms.send(smsData)

        currentAccount.la_client_pin_reset_code = one_time_password;
        currentAccount.la_client_pin_reset_code_expiry_date = Date.now() + 3600000;
        currentAccount.la_client_updated_at = Date.now();

        const updatedUser = await currentAccount.save()

        res.status(200).json({
            status: 200,
            message: "Reset code sent successfully",
            _id: updatedUser._id.toString(),
            la_user_phone_number: updatedUser.la_client_phone_number,
            la_user_account_pin_reset_code: updatedUser.la_client_pin_reset_code
        })


    } catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_Client_pin_reset_code_verification_controller = async function (req, res, next) {
    const { la_client_pin_reset_code } = req.params;
    try {
        const errors = []
        if (validator.isEmpty(la_client_pin_reset_code)) {
            errors.push({ message: "Enter a valid reset code" })
        }

        if (errors.length > 0) {
            const error = new Error("Invalid input");
            error.data = errors;
            error.code = 400;
            throw error;
        }

        const accountInformation = await La_clients_account_information_model.findOne({
            la_client_pin_reset_code: la_client_pin_reset_code,
            la_client_pin_reset_code_expiry_date: {
                $gte: Date.now()
            }
        })

        if (!accountInformation) {
            const error = new Error("Reset code not found");
            error.code = 404;
            throw error;
        }

        accountInformation.la_client_pin_reset_code = undefined;
        accountInformation.la_client_pin_reset_code_expiry_date = undefined;
        accountInformation.la_client_updated_at = Date.now();

        const userInformation = await accountInformation.save()

        const accessToken = jwt.sign({
            userId: userInformation._id.toString(),
            phone_number: userInformation.la_client_phone_number,
            email: userInformation.la_client_email_address,
        },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "30m" });

        const refreshToken = jwt.sign({
            userId: userInformation._id.toString(),
            la_user_phone_number: userInformation.la_client_phone_number
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

exports.La_Client_phone_set_new_pin_controller = async function (req, res, next) {
    const { la_client_pin } = req.body;
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

        const newPin = await bcrypt.hash(la_client_pin, 12);

        userInformation.la_client_account_pin = newPin;
        userInformation.la_client_updated_at = Date.now();

        const updatedUser = await userInformation.save()

        res.status(200).json({
            status: 200,
            message: "Pin updated successfully",
            _id: updatedUser._id.toString(),
            la_user_email_address: updatedUser.la_client_email_address,
            la_user_phone_number: updatedUser.la_client_phone_number,
        })
    }
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_Client_Login_Controller = async function (req, res, next) {
    const { la_client_email_address, la_client_password, la_client_phone_number, la_login_with } = req.body;

    try {
        if (la_login_with === 'la_email_address') {
            const errors = []
            if (!validator.isEmail(la_client_email_address)) {
                errors.push({ message: 'Invalid Email Address' })
            }

            if (validator.isEmpty(la_client_password)) {
                errors.push({ message: 'Invalid Password' })
            }

            if (errors.length > 0) {
                const error = new Error('Invalid Input')
                error.data = errors
                error.code = 400
                throw error
            }

            const clientInformation = await La_clients_account_information_model.findOne({
                la_client_email_address: la_client_email_address,
            })

            if (!clientInformation) {
                const error = new Error('Invalid Email Address')
                error.code = 404
                throw error
            }

            const isPasswordValid = await bcrypt.compare(la_client_password, clientInformation.la_client_password)

            if (!isPasswordValid) {
                const error = new Error('Invalid Password')
                error.code = 404
                throw error
            }

            if (!clientInformation.la_client_is_verified) {
                const error = new Error('Account Not Verified')
                error.code = 401
                throw error
            }

            const accessToken = jwt.sign(
                {
                    userId: clientInformation._id,
                    email: clientInformation.la_client_email_address,
                }, process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '30m' }
            )

            const refreshToken = jwt.sign(
                {
                    userId: clientInformation._id,
                    email: clientInformation.la_client_email_address,
                },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '30d' }
            )

            await La_token_information({
                la_user_id: clientInformation._id,
                la_refresh_token: refreshToken,
            }).save()

            res.status(200).json({
                status: 200,
                message: "Login Successfully",
                _id: clientInformation._id,
                token: accessToken,
                refreshToken: refreshToken,
            })
        }
        else {
            const errors = []
            if (validator.isEmpty(la_client_phone_number)) {
                errors.push({ message: 'Invalid Phone Number' })
            }

            if (errors.length > 0) {
                const error = new Error('Invalid Input')
                error.data = errors
                error.code = 400
                throw error
            }

            const clientInformation = await La_clients_account_information_model.findOne({
                la_client_phone_number: la_client_phone_number,
            })

            if (!clientInformation) {
                const error = new Error('Invalid Phone Number')
                error.code = 404
                throw error
            }

            if (!clientInformation.la_client_is_verified) {
                const error = new Error('Account Not Verified')
                error.code = 401
                throw error
            }

            const one_time_password = otpGenerator.generate(4,
                {
                    upperCaseAlphabets: false,
                    specialChars: false,
                    lowerCaseAlphabets: false,
                    digits: true
                }
            );

            const smsData = {
                to: clientInformation.la_client_phone_number,
                message: ("Your Fitspiration Contributor App One Time Password is").concat(" ", one_time_password),
                enqueue: true
            }

            sms.send(smsData)

            clientInformation.la_client_verification_code = one_time_password;
            clientInformation.la_client_verification_code_expiry_at = Date.now() + 3600000;
            clientInformation.la_client_updated_at = Date.now();
            await clientInformation.save();

            res.status(200).json({
                status: 200,
                message: "Login Successful",
                id: clientInformation._id,
                one_time_password: one_time_password,
            })

        }
    }
    catch (error) {
        res.json({ message: error.message, status: error.code });
        next()
    }
}

exports.La_Client_phone_login_verification_code_controller = async function (req, res, next) {
    const { la_client_verification_code } = req.params;
    try {
        const errors = []
        if (validator.isEmpty(la_client_verification_code)) {
            errors.push({ message: "Enter a valid verification code" })
        }

        if (errors.length > 0) {
            const error = new Error("Invalid input");
            error.data = errors;
            error.code = 400;
            throw error;
        }

        const userInformation = await La_clients_account_information_model.findOne({
            la_client_verification_code: la_client_verification_code,
            la_client_verification_code_expiry_at: {
                $gte: Date.now()
            }
        })

        if (!userInformation) {
            const error = new Error("Verification code does not exist");
            error.code = 404;
            throw error;
        }

        if (userInformation.la_client_is_verified !== true) {
            const error = new Error("Account not verified");
            error.code = 401;
            throw error;
        }

        userInformation.la_client_verification_code = undefined;
        userInformation.la_client_verification_code_expiry_at = undefined;
        userInformation.la_client_updated_at = Date.now();
        const updatedUser = await userInformation.save()

        const accessToken = jwt.sign({
            userId: updatedUser._id.toString(),
            email: updatedUser.la_client_email_address
        },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "30m" }
        );

        const refreshToken = jwt.sign({
            userId: updatedUser._id.toString(),
            la_client_email_address: updatedUser.la_client_email_address
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

exports.La_Client_phone_resend_login_verification_code_controller = async function (req, res, next) {
    const { la_client_phone_number } = req.params;
    try {
        const errors = []
        if (validator.isEmpty(la_client_phone_number)) {
            errors.push({ message: "Enter a valid phone number" })
        }

        if (errors.length > 0) {
            const error = new Error("Invalid input");
            error.data = errors;
            error.code = 400;
            throw error;
        }

        const userInformation = await La_clients_account_information_model.findOne({
            la_client_phone_number: la_client_phone_number
        })

        if (!userInformation) {
            const error = new Error("Phone number does no exist");
            error.code = 400;
            throw error;
        }


        if (userInformation.la_client_is_verified === false) {
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
            to: userInformation.la_client_phone_number,
            message: ("Your Fitspiration App One Time Password is").concat(" ", one_time_password),
            enqueue: true,
        }

        sms.send(smsData)

        userInformation.la_client_verification_code = one_time_password;
        userInformation.la_client_verification_code_expiry_at = Date.now() + 360000;
        userInformation.la_client_updated_at = Date.now();
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

exports.La_Client_Unlock_Pin_Controller = async function (req, res, next) {
    const { la_client_account_pin } = req.body;
    const { la_client_id } = req.params;

    try {

        if(!req.isAuth){
            const error = new Error("Unauthorised access, Login to continue")
            error.code = 401
            throw error
        }

        if (validator.isEmpty(la_client_account_pin)) {
            const error = new Error("Invalid pin")
            error.code = 400
            throw error
        }

        const clientInformation = await La_clients_account_information_model.findById(req.userId)

        if (!clientInformation) {
            const error = new Error('Invalid Client Id')
            error.code = 404
            throw error
        }

        const confirmPin = await bcrypt.compare(la_client_account_pin, clientInformation.la_client_account_pin)

        if (!confirmPin) {
            const error = new Error('Invalid Pin')
            error.code = 404
            throw error
        }

        if (!clientInformation.la_client_is_verified) {
            const error = new Error('Account Not Verified')
            error.code = 401
            throw error
        }

        const accessToken = jwt.sign(
            {
                userId: clientInformation._id,
                email: clientInformation.la_client_email_address,
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '30m' }
        )

        const refreshToken = jwt.sign(
            {
                userId: clientInformation._id,
                email: clientInformation.la_client_email_address,
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '30d' }
        )

        await new La_token_information({
            la_user_id: clientInformation._id,
            la_refresh_token: refreshToken,
        }).save()

        res.status(200).json({
            status: 200,
            message: "Pin Unlocked Successfully",
            _id: clientInformation._id,
            accessToken: accessToken,
            refreshToken: refreshToken,
            ...clientInformation._doc,
        })

    } catch (error) {
        res.json({ message: error.message, status: error.code });
        next()
    }

}

exports.La_Client_Logout_Controller = async function (req, res, next) {
    const { la_refresh_token } = req.params;

    try {
        if (!req.isAuth) {
            const error = new Error('Unauthorised access, Login to continue')
            error.code = 401
            throw error
        }

        const tokenInformation = await La_token_information.findOne({
            la_refresh_token: la_refresh_token,
        })

        if (!tokenInformation) {
            const error = new Error('Invalid Refresh Token')
            error.code = 404
            throw error
        }

        await La_token_information.findOneAndDelete({
            la_refresh_token: la_refresh_token,
        })

        res.status(200).json({
            status: 200,
            message: "Logout Successful",
        })
    }
    catch (error) {
        res.json({ message: error.message, status: error.code });
        next()
    }
}

exports.La_Client_Refresh_Token_Controller = async function (req, res, next) {
    const { la_refresh_token } = req.params;

    try {
        const tokenInformation = await La_token_information.findOne({
            la_refresh_token: la_refresh_token,
        })

        if (!tokenInformation) {
            const error = new Error('Invalid Refresh Token')
            error.code = 404
            throw error
        }

        const payload = jwt.verify(la_refresh_token, process.env.REFRESH_TOKEN_SECRET)

        if (!payload) {
            const error = new Error('Invalid Refresh Token')
            error.code = 404
            throw error
        }

        const accessToken = jwt.sign(
            {
                userId: payload.userId,
            }, process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '30m' }
        )

        res.status(200).json({
            status: 200,
            message: "Token generated Successful",
            userId: payload.userId,
            token: accessToken,
            refreshToken: tokenInformation.la_refresh_token,
        })
    }
    catch (error) {
        res.json({ message: error.message, status: error.code });
        next()
    }
}

exports.La_Client_Update_Profile_Information_Controller = async function (req, res, next) {
    const {
        la_client_first_name,
        la_client_last_name,
        la_client_middle_name,
        la_client_username,
        la_client_date_of_birth,
        la_client_gender,
        la_client_identification_type,
        la_client_identification_number,
        la_client_identification_country_of_issue,

    } = req.body;

    try {
        if (!req.isAuth) {
            const error = new Error("Unauthorised access, Login to continue");
            error.code = 401;
            throw error;
        }

        const clientInformation = await La_clients_account_information_model.findById(req.userId)

        if (!clientInformation) {
            const error = new Error("User not found")
            error.code = 404;
            throw error;
        }

        if (!clientInformation.la_client_is_verified) {
            const error = new Error("User not verified")
            error.code = 401
            throw error
        }

        if (la_client_first_name !== undefined) {
            clientInformation.la_client_first_name = la_client_first_name;
        }

        if (la_client_last_name !== undefined) {
            clientInformation.la_client_last_name = la_client_last_name;
        }

        if (la_client_middle_name !== undefined) {
            clientInformation.la_client_middle_name = la_client_middle_name;
        }

        if (la_client_username !== undefined) {
            clientInformation.la_client_username = la_client_username;
        }

        if (la_client_date_of_birth !== undefined) {
            clientInformation.la_client_date_of_birth = la_client_date_of_birth;
        }

        if (la_client_gender !== undefined) {
            clientInformation.la_client_gender = la_client_gender
        }

        if (la_client_identification_type !== undefined) {
            clientInformation.la_client_identification_type = la_client_identification_type
        }

        if (la_client_identification_number !== undefined) {
            clientInformation.la_client_identification_number = la_client_identification_number
        }

        if (la_client_identification_country_of_issue !== undefined) {
            clientInformation.la_client_identification_country_of_issue = la_client_identification_country_of_issue
        }

        clientInformation.la_client_updated_at = new Date()

        const updatedInformation = await clientInformation.save()

        res.status(200).json({
            status: 200,
            message: "Profile Information Updated Successfully",
            data: updatedInformation
        })

    }
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_Create_Client_Address_Information_Controller = async function (req, res, next) {
    const {
        la_client_country,
        la_client_city,
        la_client_state,
        la_client_postal_code,
        la_client_address_one,
        la_client_address_two
    } = req.body;
    try {
        if (!req.isAuth) {
            const error = new Error("Unauthorised access, Login to continue");
            error.code = 401;
            throw error;
        }

        const clientInformation = await La_clients_account_information_model.findById(req.userId)

        if (!clientInformation) {
            const error = new Error("User not found");
            error.code = 404;
            throw error;
        }

        clientInformation.la_client_address_information = {
            la_client_country: la_client_country,
            la_client_city: la_client_city,
            la_client_state: la_client_state,
            la_client_postal_code: la_client_postal_code,
            la_client_address_one: la_client_address_one,
            la_client_address_two: la_client_address_two
        }

        clientInformation.la_client_profile_completed = true
        clientInformation.la_client_updated_at = new Date();

        const updatedInformation = await clientInformation.save()

        res.status(200).json({
            status: 200,
            message: "Address Information Updated Successfully",
            data: updatedInformation,
        })
    }
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_client_get_account_information_controller = async function(req, res, next){
    try{
        if(!req.isAuth){
            const error = new Error("Unauthorised access, login to continue")
            error.code = 401
            throw error
        }

        const userInformation = await La_clients_account_information_model.findById(req.userId)

        if (!userInformation) {
            const error = new Error("User not found")
            error.code = 404;
            throw error;
        }

        res.status(200).json({
            status: 200,
            message: "Account information retrieved successfully",
            data: userInformation
        })
    }
    catch(error){
        res.json({message: error.message, status: error.code})
        next()
    }
}