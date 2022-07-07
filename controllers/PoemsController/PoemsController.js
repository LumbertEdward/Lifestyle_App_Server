const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const otpGenerator = require('otp-generator');
const La_clients_account_information_model = require('../../models/UserManagementModels/la_clients_account_information_model');
const La_Client_Poems_Information_Model = require('../../models/PoemsModels/la_poems_model')

exports.La_Create_Poems_Controller = async function (req, res, next) {
    const {
        la_poems_topic,
        la_poems_title,
        la_poems_author,
        la_poems_content,
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

        const addedPoem = new La_Client_Poems_Information_Model({
            la_client_id: req.userId,
            la_poems_topic: la_poems_topic,
            la_poems_title: la_poems_title,
            la_poems_author: la_poems_author,
            la_poems_content: la_poems_content,
            la_poems_created_at: Date.now(),
            la_poems_updated_at: Date.now(),
        })

        const savedPoem = await addedPoem.save();

        userInformation.la_client_poems.push(savedPoem._id);

        await userInformation.save()

        res.status(200).json({
            status: 200,
            message: "Poems added successfully",
            data: savedPoem
        })
    }
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_Update_Poem_Controller = async function (req, res, next) {
    const { la_poems_id } = req.params;
    const {
        la_poems_topic,
        la_poems_title,
        la_poems_author,
        la_poems_content,
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

        const poemInformation = await La_Client_Poems_Information_Model.findById(la_poems_id)

        if (!poemInformation) {
            const error = new Error("Poem not found")
            error.code = 404;
            throw error;
        }

        if(la_poems_topic !== undefined){
            poemInformation.la_poems_topic = la_poems_topic
        }

        if(la_poems_title !== undefined){
            poemInformation.la_poems_title = la_poems_title
        }

        if(la_poems_author !== undefined){
            poemInformation.la_poems_author = la_poems_author
        }

        if(la_poems_content !== undefined){
            poemInformation.la_poems_content = la_poems_content
        }

        poemInformation.la_poems_updated_at = Date.now()

        const updatedPoem = await poemInformation.save();

        res.status(200).json({
            status: 200,
            message: "Poem updated successfully",
            data: updatedPoem
        })
    }
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_Delete_Poem_Controller = async function (req, res, next) {
    const { la_poems_id } = req.params;

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

        const poemInformation = await La_Client_Poems_Information_Model.findById(la_poems_id)

        if (!poemInformation) {
            const error = new Error("Poem not found")
            error.code = 404;
            throw error;
        }

        await La_Client_Poems_Information_Model.findOneAndDelete({
            _id: la_poems_id
        });

        userInformation.la_client_poems.filter((item) => item != deletedPoem._id);

        await userInformation.save()

        res.status(200).json({
            status: 200,
            message: "Poem deleted successfully",
        })
    }
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_Get_All_Poems_Controller = async function (req, res, next) {
    try{
        if(!req.isAuth){
            const error = new Error("Unauthorised access, Login to continue")
            error.code = 401
            throw error
        }

        const poems = await La_Client_Poems_Information_Model.find()

        res.status(200).json({
            status: 200,
            message: "Poems retrieved successfully",
            poems: poems
        })
    }
    catch(error){
        res.json({message: error.data, status: error.code})
        next()
    }

}

exports.La_Get_Poem_By_Id_Controller = async function (req, res, next) {
    const { la_poem_id } = req.params
    try{
        if(!req.isAuth){
            const error = new Error("Unauthorised access, Login to continue")
            error.code = 401;
            throw error;
        }

        if(validator.isEmpty(la_poem_id)){
            const error = new Error("Invalid inputs")
            error.code = 400;
            throw error;
        }

        const poem = await La_Client_Poems_Information_Model.findById(la_poem_id);

        if(!poem){
            const error = new Error("Poem not found")
            error.code = 404;
            throw error;
        }

        res.status(200).json({
            status: 200,
            message: "Poem retrieved successfully",
            data: poem
        })
    }
    catch(error){
        res.json({ message: error.data, status: error.code })
        next()
    }
}

exports.La_Get_All_Poem_Topics_Controller = async function(req, res, next){
    try{
        if(!req.isAuth){
            const error = new Error("Unauthorised access, Login to continue")
            error.code = 401
            throw error
        }

        let topics = []

        const poems = await La_Client_Poems_Information_Model.find()

        if(poems.length > 0){
            for(let i = 0; i < poems.length; i++){
                const status = topics.filter((item) => item.la_poems_topic == poems[i].la_poems_topic)
                if(status.length < 1){
                    topics.push(poems[i].la_poems_topic)
                }
            }
        }

        res.status(200).json({
            status: 200,
            message: "Retrived successfully",
            data: topics
        })
    }
    catch(error){
        res.json({message: error.data, status: error.code})
        next()
    }
}

exports.La_Get_Poem_By_Topic_Controller = async function (req, res, next) {
    const { la_poem_topic } = req.params
    try{
        if(!req.isAuth){
            const error = new Error("Unauthorised access, Login to continue")
            error.code = 401;
            throw error;
        }

        if(validator.isEmpty(la_poem_topic)){
            const error = new Error("Invalid inputs")
            error.code = 400;
            throw error;
        }

        const poems = await La_Client_Poems_Information_Model.findMany({
            la_poems_topic: la_poem_topic
        });

        if(!poems){
            const error = new Error("Poems not found")
            error.code = 404
            throw error;
        }

        res.status(200).json({
            status: 200,
            message: "Poems retrieved successfully",
            data: poems
        })
    }
    catch(error){
        res.json({ message: error.data, status: error.code })
        next()
    }
}

exports.La_Get_Poem_By_Author_Controller = async function (req, res, next) {
    const { la_poem_author } = req.params
    try{
        if(!req.isAuth){
            const error = new Error("Unauthorised access, Login to continue")
            error.code = 401;
            throw error;
        }

        if(validator.isEmpty(la_poem_author)){
            const error = new Error("Invalid inputs")
            error.code = 400;
            throw error;
        }

        const poems = await La_Client_Poems_Information_Model.find({
            la_poems_author: la_poem_author
        });

        if(!poems){
            const error = new Error("Poems not found")
            error.code = 404
            throw error;
        }

        res.status(200).json({
            status: 200,
            message: "Poems retrieved successfully",
            data: poems
        })
    }
    catch(error){
        res.json({ message: error.data, status: error.code })
        next()
    }
}