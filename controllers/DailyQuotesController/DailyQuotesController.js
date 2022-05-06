const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const otpGenerator = require('otp-generator');
const La_clients_account_information_model = require('../../models/UserManagementModels/la_clients_account_information_model');
const La_Daily_Quotes_Information_Model = require('../../models/DailyQuotesModel/la_daily_quotes_model');

exports.La_Create_Daily_Quotes_Controller = async function (req, res, next) {
    const {
        la_daily_quotes_quote,
        la_daily_quotes_author,
        la_daily_quotes_category,
        la_daily_quotes_source,
    } = req.body;

    try {
        if (!req.isAuth) {
            const error = new Error("Unauthorised access, Login to continue")
            error.code = 401;
            throw error;
        }

        const userInformation = await La_clients_account_information_model.findById(req.userId)

        if (!userInformation) {
            const error = new Error("User not found")
            error.code = 404;
            throw error;
        }

        const addedQuote = new La_Daily_Quotes_Information_Model({
            la_client_id: req.userId,
            la_daily_quotes_quote: la_daily_quotes_quote,
            la_daily_quotes_author: la_daily_quotes_author,
            la_daily_quotes_category: la_daily_quotes_category,
            la_daily_quotes_source: la_daily_quotes_source,
            la_daily_quotes_created_at: Date.now(),
            la_daily_quotes_updated_at: Date.now(),
        })

        const savedQuote = await addedQuote.save();

        userInformation.la_client_daily_quotes.push(savedQuote._id);

        await userInformation.save()

        res.status(200).json({
            status: 200,
            message: "Daily quotes added successfully",
            data: savedQuote
        })
    }
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_Update_Daily_Quotes_Controller = async function (req, res, next){
    const { la_daily_quotes_id } = req.params;
    const {
        la_daily_quotes_quote,
        la_daily_quotes_author,
        la_daily_quotes_category,
        la_daily_quotes_source,
    } = req.body;

    try {
        if (!req.isAuth) {
            const error = new Error("Unauthorised access, Login to continue")
            error.code = 401;
            throw error;
        }

        const userInformation = await La_clients_account_information_model.findById(req.userId)

        if (!userInformation) {
            const error = new Error("User not found")
            error.code = 404;
            throw error;
        }

        const quoteInformation = await La_Daily_Quotes_Information_Model.findById(la_daily_quotes_id)

        if (!quoteInformation) {
            const error = new Error("Quote not found")
            error.code = 404;
            throw error;
        }

        if(la_daily_quotes_quote !== undefined){
            quoteInformation.la_daily_quotes_quote = la_daily_quotes_quote;
        }

        if(la_daily_quotes_author !== undefined){
            quoteInformation.la_daily_quotes_author = la_daily_quotes_author;
        }

        if(la_daily_quotes_category !== undefined){
            quoteInformation.la_daily_quotes_category = la_daily_quotes_category;
        }

        if(la_daily_quotes_source !== undefined){
            quoteInformation.la_daily_quotes_source = la_daily_quotes_source;
        }

        quoteInformation.la_daily_quotes_updated_at = Date.now();

        const updatedQuote = await quoteInformation.save();

        res.status(200).json({
            status: 200,
            message: "Daily quotes updated successfully",
            data: updatedQuote
        })
    }
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_Delete_Daily_Quote_Controller = async function (req, res, next) {
    const { la_daily_quotes_id } = req.params;

    try {
        if (!req.isAuth) {
            const error = new Error("Unauthorised access, Login to continue")
            error.code = 401;
            throw error;
        }

        const userInformation = await La_clients_account_information_model.findById(req.userId)

        if (!userInformation) {
            const error = new Error("User not found")
            error.code = 404;
            throw error;
        }

        const quoteInformation = await La_Daily_Quotes_Information_Model.findById(la_daily_quotes_id)

        if (!quoteInformation) {
            const error = new Error("Quote not found")
            error.code = 404;
            throw error;
        }

        await La_Daily_Quotes_Information_Model.findOneAndDelete({ 
            _id: la_daily_quotes_id 
        });

        res.status(200).json({
            status: 200,
            message: "Daily quote deleted successfully",
        })
    }
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}