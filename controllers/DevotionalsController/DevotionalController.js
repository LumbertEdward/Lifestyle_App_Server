const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const otpGenerator = require('otp-generator');
const La_clients_account_information_model = require('../../models/UserManagementModels/la_clients_account_information_model');
const La_Clients_Devotional_Model = require('../../models/DevotionalModels/la_devotionals_models');
const La_Clients_Devotional_Titles_Model = require('../../models/DevotionalModels/la_devotionals_titles_model');

exports.La_Create_Devotional_Controller = async function (req, res, next) {
    const { 
        la_client_id,
        la_devotionals_topic,
     } = req.body;

     try{
         if(!req.isAuth){
             const error = new Error('Unauthorised access, login to continue!');
             error.code = 401;
             throw error;
         }

         const userInformation = await La_clients_account_information_model.findOne({
             _id: req.userId
        });

        if(!userInformation){
            const error = new Error('User not found!');
            error.code = 404;
            throw error;
        }

        const createdDevotional = new La_Clients_Devotional_Model({
            la_client_id: la_client_id,
            la_devotionals_topic: la_devotionals_topic,
            la_devotionals_created_at: Date.now(),
            la_devotionals_updated_at: Date.now(),
        })

        const addedDevotional = await createdDevotional.save();

        res.status(200).json({
            status: 200,
            message: 'Devotional added successfully!',
            ...addedDevotional
        })
     }
     catch(error){
         res.json({message: error.message, status: error.code});
         next()
     }
}

exports.La_Update_Devotional_Controller = async function (req, res, next) {
    const { la_devotionals_id } = req.params;
    const {
        la_devotionals_topic,
    } = req.body;

    try{
        if(!req.isAuth){
            const error = new Error('Unauthorised access, login to continue!');
            error.code = 401;
            throw error;
        }

        const userInformation = await La_clients_account_information_model.findOne({
            _id: req.userId
        })

        if(!userInformation){
            const error = new Error('User not found!');
            error.code = 404;
            throw error;
        }

        const updatedDevotional = await La_Clients_Devotional_Model.findOne({
            _id: la_devotionals_id
        })

        if(!updatedDevotional){
            const error = new Error('Devotional not found!');
            error.code = 404;
            throw error;
        }

        updatedDevotional.la_devotionals_topic = la_devotionals_topic;
        updatedDevotional.la_devotionals_updated_at = Date.now();

        const updatedDevotionalUpdated = await updatedDevotional.save();

        res.status(200).json({
            status: 200,
            message: 'Devotional updated successfully!',
            ...updatedDevotionalUpdated
        })
    }
    catch(error){
        res.json({message: error.message, status: error.code});
        next()
    }
}

exports.La_Delete_Devotional_Controller = async function (req, res, next) {
    const { la_devotionals_id } = req.params;
    
    try{
        if(!req.isAuth){
            const error = new Error('Unauthorised access, login to continue!');
            error.code = 401;
            throw error;
        }

        const userInformation = await La_clients_account_information_model.findOne({
            _id: req.userId
        })

        if(!userInformation){
            const error = new Error('User not found!');
            error.code = 404;
            throw error;
        }

        const devotionalToDelete = await La_Clients_Devotional_Model.findOne({
            _id: la_devotionals_id
        })

        if(!devotionalToDelete){
            const error = new Error('Devotional not found!');
            error.code = 404;
            throw error;
        }

        await La_Clients_Devotional_Model.findOneAndDelete({
            _id: la_devotionals_id
        })

        res.status(200).json({
            status: 200,
            message: 'Devotional deleted successfully!'
        })
    }
    catch(error){
        res.json({message: error.message, status: error.code});
        next()
    }
}

exports.La_Add_Devotional_Title_Controller = async function (req, res, next) {
    const { la_devotionals_id } = req.params;
    const {
        la_devotionals_title,
        la_devotionals_author,
    } = req.body;

    try{
        if(!req.isAuth){
            const error = new Error('Unauthorised access, login to continue!');
            error.code = 401;
            throw error;
        }

        const userInformation = await La_clients_account_information_model.findOne({
            _id: req.userId
        })

        if(!userInformation){
            const error = new Error('User not found!');
            error.code = 404;
            throw error;
        }

        const devotionalToAddTitle = await La_Clients_Devotional_Model.findOne({
            _id: la_devotionals_id
        })

        if(!devotionalToAddTitle){
            const error = new Error('Devotional not found!');
            error.code = 404;
            throw error;
        }

        const createdDevotionalTitle = new La_Clients_Devotional_Titles_Model({
            la_devotionals_title: la_devotionals_title,
            la_devotionals_topic_id: la_devotionals_id,
            la_devotionals_author: la_devotionals_author,
            la_devotionals_titles_created_at: Date.now(),
            la_devotionals_titles_updated_at: Date.now(),
        })

        const addedDevotionalTitle = await createdDevotionalTitle.save();

        devotionalToAddTitle.la_devotionals_titles.push(addedDevotionalTitle);
        devotionalToAddTitle.la_devotionals_updated_at = Date.now();

        await devotionalToAddTitle.save();

        res.status(200).json({
            status: 200,
            message: 'Devotional title added successfully!',
            ...addedDevotionalTitle
        })
    } 
    catch(error){
        res.json({message: error.message, status: error.code});
        next()
    }
}

exports.La_Add_Devotional_Title_Verses_Controller = async function (req, res, next) {
    const { la_devotionals_titles_id } = req.params;

    const{
        la_devotionals_titles_verses,
    } = req.body;

    try{
        if(!req.isAuth){
            const error = new Error('Unauthorised access, login to continue!');
            error.code = 401;
            throw error;
        }

        const userInformation = await La_clients_account_information_model.findOne({
            _id: req.userId
        })

        if(!userInformation){
            const error = new Error('User not found!');
            error.code = 404;
            throw error;
        }

        const devotionalTitleToAddVerses = await La_Clients_Devotional_Titles_Model.findOne({
            _id: la_devotionals_titles_id
        })

        if(!devotionalTitleToAddVerses){
            const error = new Error('Devotional title not found!');
            error.code = 404;
            throw error;
        }

        devotionalTitleToAddVerses.la_devotionals_verses.push(la_devotionals_titles_verses);
        devotionalTitleToAddVerses.la_devotionals_updated_at = Date.now();

        const updatedDevotionalTitleVerses = await devotionalTitleToAddVerses.save();

        res.status(200).json({
            status: 200,
            message: 'Devotional title verses added successfully!',
            ...updatedDevotionalTitleVerses
        })
    }
    catch(error){
        res.json({message: error.message, status: error.code});
        next()
    }
}

exports.La_Add_Devotional_Title_Content_Controller = async function (req, res, next) {
    const { la_devotionals_titles_id } = req.params;

    const {
        la_devotional_sermon_audio_url,
        la_devotional_sermon_author,
        la_devotional_sermon_content,
        la_devotional_sermon_image,
        la_devotional_sermon_video_url,
    }
    = req.body;

    try{
        if(!req.isAuth){
            const error = new Error('Unauthorised access, login to continue!');
            error.code = 401;
            throw error;
        }

        const userInformation = await La_clients_account_information_model.findOne({
            _id: req.userId
        })

        if(!userInformation){
            const error = new Error('User not found!');
            error.code = 404;
            throw error;
        }

        const devotionalTitleToAddContent = await La_Clients_Devotional_Titles_Model.findOne({
            _id: la_devotionals_titles_id
        })

        if(!devotionalTitleToAddContent){
            const error = new Error('Devotional title not found!');
            error.code = 404;
            throw error;
        }

        devotionalTitleToAddContent.la_devotionals_title_content = {
            la_devotional_sermon_audio_url: la_devotional_sermon_audio_url,
            la_devotional_sermon_author: la_devotional_sermon_author,
            la_devotional_sermon_content: la_devotional_sermon_content,
            la_devotional_sermon_image: la_devotional_sermon_image,
            la_devotional_sermon_video_url: la_devotional_sermon_video_url,
        };

        devotionalTitleToAddContent.la_devotionals_updated_at = Date.now();

        const updatedDevotionalTitleContent = await devotionalTitleToAddContent.save();

        res.status(200).json({
            status: 200,
            message: 'Devotional title content added successfully!',
            ...updatedDevotionalTitleContent
        })
    }
    catch(error){
        res.json({message: error.message, status: error.code});
        next()
    }
}

exports.La_Update_Devotional_Title_Controller = async function (req, res, next) {
    const { la_devotional_title_id } = req.params;
    const {
        la_devotionals_title,
        la_devotionals_author,
    } = req.body;

    try{
        if(!req.isAuth){
            const error = new Error('Unauthorised access, login to continue!');
            error.code = 401;
            throw error;
        }

        const userInformation = await La_clients_account_information_model.findOne({
            _id: req.userId
        })

        if(!userInformation){
            const error = new Error('User not found!');
            error.code = 404;
            throw error;
        }

        const devotionalTitleToUpdate = await La_Clients_Devotional_Titles_Model.findOne({
            _id: la_devotional_title_id
        })

        if(!devotionalTitleToUpdate){
            const error = new Error('Devotional title not found!');
            error.code = 404;
            throw error;
        }

        devotionalTitleToUpdate.la_devotionals_title = la_devotionals_title;
        devotionalTitleToUpdate.la_devotionals_author = la_devotionals_author;
        devotionalTitleToUpdate.la_devotionals_updated_at = Date.now();

        const updatedDevotionalTitle = await devotionalTitleToUpdate.save();

        res.status(200).json({
            status: 200,
            message: 'Devotional title updated successfully!',
            ...updatedDevotionalTitle
        })
    }
    catch(error){
        res.json({message: error.message, status: error.code});
        next()
    }
}

exports.La_Update_Devotional_Title_Content_Controller = async function (req, res, next) {
    const { la_devotionals_title_id } = req.params;

    const {
        la_devotional_sermon_audio_url,
        la_devotional_sermon_author,
        la_devotional_sermon_content,
        la_devotional_sermon_image,
        la_devotional_sermon_video_url,
    }
    = req.body;

    try{
        if(!req.isAuth){
            const error = new Error('Unauthorised access, login to continue!');
            error.code = 401;
            throw error;
        }

        const userInformation = await La_clients_account_information_model.findOne({
            _id: req.userId
        })

        if(!userInformation){
            const error = new Error('User not found!');
            error.code = 404;
            throw error;
        }

        const devotionalTitleToUpdateContent = await La_Clients_Devotional_Titles_Model.findOne({
            _id: la_devotionals_title_id
        })

        if(!devotionalTitleToUpdateContent){
            const error = new Error('Devotional title not found!');
            error.code = 404;
            throw error;
        }

        devotionalTitleToUpdateContent.la_devotionals_title_content.la_devotional_sermon_audio_url = la_devotional_sermon_audio_url;
        devotionalTitleToUpdateContent.la_devotionals_title_content.la_devotional_sermon_author = la_devotional_sermon_author;
        devotionalTitleToUpdateContent.la_devotionals_title_content.la_devotional_sermon_content = la_devotional_sermon_content;
        devotionalTitleToUpdateContent.la_devotionals_title_content.la_devotional_sermon_image = la_devotional_sermon_image;
        devotionalTitleToUpdateContent.la_devotionals_title_content.la_devotional_sermon_video_url = la_devotional_sermon_video_url;

        devotionalTitleToUpdateContent.la_devotionals_updated_at = Date.now();

        const updatedDevotionalTitleContent = await devotionalTitleToUpdateContent.save();

        res.status(200).json({
            status: 200,
            message: 'Devotional title content updated successfully!',
            ...updatedDevotionalTitleContent
        })
    }
    catch(error){
        res.json({message: error.message, status: error.code});
        next()
    }
}

exports.La_Get_Devotionals_Topics_Controller = async function (req, res, next) {
    try{
        if(!req.isAuth){
            const error = new Error('Unauthorised access, login to continue!');
            error.code = 401;
            throw error;
        }

        const userInformation = await La_clients_account_information_model.findOne({
            _id: req.userId
        })

        if(!userInformation){
            const error = new Error('User not found!');
            error.code = 404;
            throw error;
        }

        const devotionalTopics = await La_Clients_Devotional_Model.find()

        res.status(200).json({
            status: 200,
            message: 'Devotionals topics retrieved successfully!',
            ...devotionalTopics
        })
    }
    catch(error){
        res.json({message: error.message, status: error.code});
        next()
    }
}

exports.La_Get_Devotional_Topic_Titles_Controller = async function (req, res, next) {
    const { la_devotionals_topic_id } = req.params;

    try{
        if(!req.isAuth){
            const error = new Error('Unauthorised access, login to continue!');
            error.code = 401;
            throw error;
        }

        const userInformation = await La_clients_account_information_model.findOne({
            _id: req.userId
        })

        if(!userInformation){
            const error = new Error('User not found!');
            error.code = 404;
            throw error;
        }

        const devotionalTopicTitles = await La_Clients_Devotional_Model.findOne({
            _id: la_devotionals_topic_id
        })

        if(!devotionalTopicTitles){
            const error = new Error('Devotional topic not found!');
            error.code = 404;
            throw error;
        }

        res.status(200).json({
            status: 200,
            message: 'Devotional topic titles retrieved successfully!',
            ...devotionalTopicTitles
        })
    }
    catch(error){
        res.json({message: error.message, status: error.code});
        next()
    }
}

exports.La_Get_Devotional_Title_Content_Controller = async function (req, res, next) {
    const { la_devotionals_title_id } = req.params;

    try{
        if(!req.isAuth){
            const error = new Error('Unauthorised access, login to continue!');
            error.code = 401;
            throw error;
        }

        const userInformation = await La_clients_account_information_model.findOne({
            _id: req.userId
        })

        if(!userInformation){
            const error = new Error('User not found!');
            error.code = 404;
            throw error;
        }

        const devotionalTitleContent = await La_Clients_Devotional_Titles_Model.findOne({
            _id: la_devotionals_title_id
        })

        if(!devotionalTitleContent){
            const error = new Error('Devotional title not found!');
            error.code = 404;
            throw error;
        }

        res.status(200).json({
            status: 200,
            message: 'Devotional title content retrieved successfully!',
            ...devotionalTitleContent
        })
    }
    catch(error){
        res.json({message: error.message, status: error.code});
        next()
    }
}