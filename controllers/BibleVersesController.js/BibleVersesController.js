const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const otpGenerator = require('otp-generator');
const La_clients_account_information_model = require('../../models/UserManagementModels/la_clients_account_information_model');
const La_Client_Bible_Verses_Model = require('../../models/BibleVersesModels/la_daily_bible_verses_model');

exports.La_Create_Bible_verse_Controller = async function (req, res, next) {
    const {
        la_daily_bible_verses_verse,
        la_daily_bible_verses_chapter,
        la_daily_bible_version,
        la_daily_bible_verses_feeling,
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

        const addedVerse = new La_Client_Bible_Verses_Model({
            la_client_id: req.userId,
            la_daily_bible_verses_verse: la_daily_bible_verses_verse,
            la_daily_bible_verses_chapter: la_daily_bible_verses_chapter,
            la_daily_bible_version: la_daily_bible_version,
            la_daily_bible_verses_feeling: la_daily_bible_verses_feeling,
            la_daily_bible_verses_created_at: Date.now(),
            la_daily_bible_verses_updated_at: Date.now(),
        })

        const savedVerse = await addedVerse.save();

        userInformation.la_client_bible_verses.push(savedVerse._id);

        await userInformation.save()

        res.status(200).json({
            status: 200,
            message: "Bible verse added successfully",
            data: savedVerse
        })
    }
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_Update_Bible_Verse_Controller = async function (req, res, next) {
    const { la_bible_verse_id } = req.params;
    const {
        la_daily_bible_verses_verse,
        la_daily_bible_verses_chapter,
        la_daily_bible_version,
        la_daily_bible_verses_feeling,
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

        const verse = await La_Client_Bible_Verses_Model.findById(la_bible_verse_id)

        if (!verse) {
            const error = new Error("Bible verse not found")
            error.code = 404;
            throw error;
        }

        if(la_daily_bible_verses_verse !== undefined){
            verse.la_daily_bible_verses_verse = la_daily_bible_verses_verse;
        }

        if(la_daily_bible_verses_chapter !== undefined){
            verse.la_daily_bible_verses_chapter = la_daily_bible_verses_chapter;
        }

        if(la_daily_bible_version !== undefined){
            verse.la_daily_bible_version = la_daily_bible_version;
        }

        if(la_daily_bible_verses_feeling !== undefined){
            verse.la_daily_bible_verses_feeling = la_daily_bible_verses_feeling;
        }    
        
        verse.la_daily_bible_verses_updated_at = Date.now();

        const updatedVerse = await verse.save()

        res.status(200).json({
            status: 200,
            message: "Bible verse updated successfully",
            data: updatedVerse
        })
    }
    catch(error){
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_Delete_Bible_Verse_Information_Controller = async function (req, res, next) {
    const { la_bible_verse_id } = req.params;

    try{
        if(!req.isAuth){
            const error = new Error("Unauthorised access, Login to continue")
            error.code = 401
            throw error
        }

        const userInformation = await La_clients_account_information_model.findById(req.userId)

        if(!userInformation){
            const error = new Error("User not found")
            error.code = 404
            throw error
        }

        const verseInformation = await La_Client_Bible_Verses_Model.findById(la_bible_verse_id)

        if(!verseInformation){
            const error = new Error("Bible verse not found")
            error.code = 404
            throw error
        }

        await La_Client_Bible_Verses_Model.findOneAndDelete({
            _id: la_bible_verse_id
        })

        res.status(200).json({
            status: 200,
            message: "Bible verse deleted successfully",
            data: verseInformation
        })
    }
    catch(error){
        res.json({ message: error.message, status: error.code })
        next()
    }
}