const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const otpGenerator = require('otp-generator');
const La_clients_account_information_model = require('../../models/UserManagementModels/la_clients_account_information_model');
const La_Meal_Plan_meals = require('../../models/MealPlanModels/la_meal_plan_information_model');
const La_meal_Plan_Meals_Meal = require('../../models/MealPlanModels/la_meal_plan_meals_model');
const La_Meal_Plan_Meals_Category = require('../../models/MealPlanModels/la_meal_plan_meals_category_model');
const La_Meal_Plan_Meals_Category_Type = require('../../models/MealPlanModels/la_meal_plan_meals_category_type_model');

exports.La_Create_Meal_Plan_Controller = async function (req, res, next) {
    const {
        la_meal_plan_diet_type,
        la_meal_plan_maximum_age,
        la_meal_plan_minimum_age,
        la_meal_plan_body_goals,
        la_meal_plan_name,
        la_meal_plan_description,
        la_meal_plan_image_url,
        la_meal_plan_image_id,
        la_meal_plan_days
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

        const addedMealPlan = new La_Meal_Plan_meals({
            la_client_id: req.userId,
            la_meal_plan_diet_type: la_meal_plan_diet_type,
            la_meal_plan_maximum_age: la_meal_plan_maximum_age,
            la_meal_plan_minimum_age: la_meal_plan_minimum_age,
            la_meal_plan_body_goals: la_meal_plan_body_goals,
            la_meal_plan_name: la_meal_plan_name,
            la_meal_plan_description: la_meal_plan_description,
            la_meal_plan_image_url: la_meal_plan_image_url,
            la_meal_plan_image_id: la_meal_plan_image_id,
            la_meal_plan_days: la_meal_plan_days,
            la_meal_plan_created_at: Date.now(),
            la_meal_plan_updated_at: Date.now(),
        })

        const savedMealPlan = await addedMealPlan.save();

        res.status(200).json({
            status: 200,
            message: "Meal Plan added successfully",
            data: savedMealPlan
        })
    }
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_Update_Meal_Plan_Controller = async function (req, res, next) {
    const { la_meal_plan_id } = req.params;
    const {
        la_meal_plan_diet_type,
        la_meal_plan_maximum_age,
        la_meal_plan_minimum_age,
        la_meal_plan_body_goals,
        la_meal_plan_name,
        la_meal_plan_description,
        la_meal_plan_image_url,
        la_meal_plan_image_id,
        la_meal_plan_days
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

        const updatedMealPlan = await La_Meal_Plan_meals.findById(la_meal_plan_id)

        if (!updatedMealPlan) {
            const error = new Error("Meal Plan not found")
            error.code = 404;
            throw error;
        }

        updatedMealPlan.la_meal_plan_diet_type = la_meal_plan_diet_type;
        updatedMealPlan.la_meal_plan_maximum_age = la_meal_plan_maximum_age;
        updatedMealPlan.la_meal_plan_minimum_age = la_meal_plan_minimum_age;
        updatedMealPlan.la_meal_plan_body_goals = la_meal_plan_body_goals;
        updatedMealPlan.la_meal_plan_name = la_meal_plan_name;
        updatedMealPlan.la_meal_plan_description = la_meal_plan_description;
        updatedMealPlan.la_meal_plan_image_url = la_meal_plan_image_url;
        updatedMealPlan.la_meal_plan_image_id = la_meal_plan_image_id;
        updatedMealPlan.la_meal_plan_days = la_meal_plan_days;
        updatedMealPlan.la_meal_plan_updated_at = Date.now();

        const savedMealPlan = await updatedMealPlan.save();

        res.status(200).json({
            status: 200,
            message: "Meal Plan updated successfully",
            data: savedMealPlan
        })

    }
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_Delete_Meal_Plan_Controller = async function (req, res, next) {
    const { la_meal_plan_id } = req.params;

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

        const deletedMealPlan = await La_Meal_Plan_meals.findById(la_meal_plan_id)

        if (!deletedMealPlan) {
            const error = new Error("Meal Plan not found")
            error.code = 404;
            throw error;
        }

        await deletedMealPlan.findOneAndDelete({
            _id: la_meal_plan_id
        });
        
        res.status(200).json({
            status: 200,
            message: "Meal Plan deleted successfully",
        })

    }
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_Get_Meal_Plans_Controller = async function (req, res, next) {
    try{
        if(!req.isAuth){
            const error = new Error("Unauthorised access, Login to continue")
            error.code = 401;
            throw error;
        }

        const userInformation = await La_clients_account_information_model.findById(req.userId)

        if(!userInformation){
            const error = new Error("User not found")
            error.code = 404;
            throw error;
        }

        const mealPlans = await La_Meal_Plan_meals.find()

        res.status(200).json({
            status: 200,
            message: "Meal Plans fetched successfully",
            data: mealPlans
        })
    }
    catch(error){
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_Get_Meal_Plan_Details_Controller = async function (req, res, next) {
    const { la_meal_plan_id } = req.params;

    try{
        if(!req.isAuth){
            const error = new Error("Unauthorised access, Login to continue")
            error.code = 401;
            throw error;
        }

        const userInformation = await La_clients_account_information_model.findById(req.userId)

        if(!userInformation){
            const error = new Error("User not found")
            error.code = 404;
            throw error;
        }

        const mealPlan = await La_Meal_Plan_meals.findById(la_meal_plan_id)

        if(!mealPlan){
            const error = new Error("Meal Plan not found")
            error.code = 404;
            throw error;
        }

        res.status(200).json({
            status: 200,
            message: "Meal Plan fetched successfully",
            data: mealPlan
        })
    }
    catch(error){
        res.json({ message: error.message, status: error.code })
        next()
    }
}

//meal

exports.La_Add_Meal_Controller = async function (req, res, next) {
    const { la_meal_plan_id } = req.params;
    const {
        la_meal_plan_meals_day,
        la_meal_plan_meals_name,
        la_meal_plan_meals_description,
        la_meal_plan_information_id,
    }
        = req.body;

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

        const mealPlan = await La_Meal_Plan_meals.findById(la_meal_plan_id)

        if (!mealPlan) {
            const error = new Error("Meal Plan not found")
            error.code = 404;
            throw error;
        }



        const addedMeal = new La_meal_Plan_Meals_Meal({
            la_meal_plan_meals_day: la_meal_plan_meals_day,
            la_meal_plan_meals_name: la_meal_plan_meals_name,
            la_meal_plan_meals_description: la_meal_plan_meals_description,
            la_meal_plan_information_id: la_meal_plan_information_id,
            la_meal_plan_meals_created_at: Date.now(),
            la_meal_plan_meals_updated_at: Date.now(),
        })

        const savedMeal = await addedMeal.save();

        mealPlan.la_meal_plan_meals.push(savedMeal._id);

        await mealPlan.save();

        res.status(200).json({
            status: 200,
            message: "Meal added successfully",
            data: savedMeal
        })
    }
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_Update_Meal_Controller = async function (req, res, next) {
    const { la_meal_plan_meals_id } = req.params;
    const {
        la_meal_plan_meals_day,
        la_meal_plan_meals_description,
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

        const updatedMeal = await La_meal_Plan_Meals_Meal.findById(la_meal_plan_meals_id)

        if (!updatedMeal) {
            const error = new Error("Meal not found")
            error.code = 404;
            throw error;
        }

        updatedMeal.la_meal_plan_meals_day = la_meal_plan_meals_day;
        updatedMeal.la_meal_plan_meals_description = la_meal_plan_meals_description;
        updatedMeal.la_meal_plan_meals_updated_at = Date.now();

        const savedMeal = await updatedMeal.save();

        res.status(200).json({
            status: 200,
            message: "Meal updated successfully",
            data: savedMeal
        })
    }
    catch(error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_Delete_Meal_Controller = async function (req, res, next) {
    const { la_meal_plan_meals_id } = req.params;

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

        const deletedMeal = await La_meal_Plan_Meals_Meal.findById(la_meal_plan_meals_id)

        if (!deletedMeal) {
            const error = new Error("Meal not found")
            error.code = 404;
            throw error;
        }

        await deletedMeal.findOneAndDelete({
            _id: la_meal_plan_meals_id
        });
    }
    catch (error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_Get_Meal_Plan_Meals_Controller = async function (req, res, next) {
    const { la_meal_plan_id } = req.params;

    try{
        if(!req.isAuth){
            const error = new Error("Unauthorised access, Login to continue")
            error.code = 401;
            throw error;
        }

        const userInformation = await La_clients_account_information_model.findById(req.userId)

        if(!userInformation){
            const error = new Error("User not found")
            error.code = 404;
            throw error;
        }

        const mealPlan = await La_Meal_Plan_meals.findById(la_meal_plan_id)

        if(!mealPlan){
            const error = new Error("Meal Plan not found")
            error.code = 404;
            throw error;
        }

        const mealPlanMeals = await La_meal_Plan_Meals_Meal.find({
            la_meal_plan_information_id: la_meal_plan_id
        })

        res.status(200).json({
            status: 200,
            message: "Meal Plan Meals retrieved successfully",
            data: mealPlanMeals
        })
    }
    catch(error){
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_Get_Single_Meal_Details_Controller = async function (req, res, next) {
    const { la_meal_plan_meal_id } = req.params;

    try{
        if(!req.isAuth){
            const error = new Error("Unauthorised access, Login to continue")
            error.code = 401;
            throw error;
        }

        const userInformation = await La_clients_account_information_model.findById(req.userId)

        if(!userInformation){
            const error = new Error("User not found")
            error.code = 404;
            throw error;
        }

        const mealPlanMeal = await La_meal_Plan_Meals_Meal.findById(la_meal_plan_meal_id)

        if(!mealPlanMeal){
            const error = new Error("Meal not found")
            error.code = 404;
            throw error;
        }

        res.status(200).json({
            status: 200,
            message: "Meal retrieved successfully",
            data: mealPlanMeal
        })


    }
    catch(error){
        res.json({ message: error.message, status: error.code })
        next()
    }
}

//meal category

exports.La_Add_Meal_Category_Controller = async function (req, res, next) {
    const { la_meal_id } = req.params;
    const { 
        la_meal_plan_meals_category_name
     } = req.body;
    try{
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

        const meal = await La_meal_Plan_Meals_Meal.findById(la_meal_id)

        if (!meal) {
            const error = new Error("Meal not found")
            error.code = 404;
            throw error;
        }

        const addedMealCategory = new La_Meal_Plan_Meals_Category({
            la_meal_plan_meals_category_name: la_meal_plan_meals_category_name,
            la_meal_plan_meals_category_created_at: Date.now(),
            la_meal_plan_meals_category_updated_at: Date.now(),
        })

        const savedMealCategory = await addedMealCategory.save();

        meal.la_meal_plan_meals_category.push(savedMealCategory._id);

        await meal.save();

        res.status(200).json({
            status: 200,
            message: "Meal category added successfully",
            data: savedMealCategory
        })
    }
    catch(error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_Update_Meal_Category_Controller = async function (req, res, next) {
    const { la_meal_plan_meals_category_id } = req.params;
    const {
        la_meal_plan_meals_category_name,
    }
    = req.body;

    try{
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

        const updatedMealCategory = await La_Meal_Plan_Meals_Category.findById(la_meal_plan_meals_category_id)

        if (!updatedMealCategory) {
            const error = new Error("Meal category not found")
            error.code = 404;
            throw error;
        }

        updatedMealCategory.la_meal_plan_meals_category_name = la_meal_plan_meals_category_name;

        updatedMealCategory.la_meal_plan_meals_category_updated_at = Date.now();

        const savedMealCategory = await updatedMealCategory.save();

        res.status(200).json({
            status: 200,
            message: "Meal category updated successfully",
            data: savedMealCategory
        })

    }
    catch(error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_Delete_Meal_Category_Controller = async function (req, res, next) {
    const { la_meal_plan_meals_category_id } = req.params;

    try{
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

        const deletedMealCategory = await La_Meal_Plan_Meals_Category.findById(la_meal_plan_meals_category_id)

        if (!deletedMealCategory) {
            const error = new Error("Meal category not found")
            error.code = 404;
            throw error;
        }

        await deletedMealCategory.findOneAndDelete({
            _id: la_meal_plan_meals_category_id
        })

        res.status(200).json({
            status: 200,
            message: "Meal category deleted successfully",
        })
    }
    catch(error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_Get_Meal_Catogories_Controller = async function (req, res, next) {
    const { la_meal_id } = req.params;

    try{
        if(!req.isAuth){
            const error = new Error("Unauthorised access, Login to continue")
            error.code = 401;
            throw error;
        }

        const userInformation = await La_clients_account_information_model.findById(req.userId)

        if(!userInformation){
            const error = new Error("User not found")
            error.code = 404;
            throw error;
        }

        const meal = await La_meal_Plan_Meals_Meal.findById(la_meal_id)

        if(!meal){
            const error = new Error("Meal not found")
            error.code = 404;
            throw error;
        }

        const allCats = meal.la_meal_plan_meals_category.map(async (item) => (
            await La_Meal_Plan_Meals_Category.find({
                _id: item._id
            })
        ));

        
    }
    catch(error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

//category type

exports.La_Add_Category_Type_Controller = async function (req, res, next) {
    const { la_meal_plan_meals_category_id } = req.params;
    const {
        la_meal_plan_meals_category_type_name,
        la_meal_plan_meals_category_type_description
    }
    = req.body;

    try{
        if(!req.isAuth){
            const error = new Error("Unauthorised access, Login to continue")
            error.code = 401;
            throw error;
        }

        const userInformation = await La_clients_account_information_model.findById(req.userId)

        if(!userInformation){
            const error = new Error("User not found")
            error.code = 404;
            throw error;
        }

        const mealCategory = await La_Meal_Plan_Meals_Category.findById(la_meal_plan_meals_category_id)

        if(!mealCategory){
            const error = new Error("Meal category not found")
            error.code = 404;
            throw error;
        }

        const addedCategoryType = new La_Meal_Plan_Meals_Category_Type({
            la_meal_plan_meals_category_type_name: la_meal_plan_meals_category_type_name,
            la_meal_plan_meals_category_type_description: la_meal_plan_meals_category_type_description,
            la_meal_plan_meals_category_type_created_at: Date.now(),
            la_meal_plan_meals_category_type_updated_at: Date.now(),
        })

        const categoryType = await addedCategoryType.save();

        mealCategory.la_meal_plan_meals_category_meal_category_types.push(categoryType._id);

        await mealCategory.save();

        res.status(200).json({
            status: 200,
            message: "Category Type added successfully",
            data: categoryType
        })
    }
    catch(error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_Update_Category_Type_Controller = async function (req, res, next) {
    const { la_meal_plan_meals_category_type_id } = req.params;
    const {
        la_meal_plan_meals_category_type_name,
        la_meal_plan_meals_category_type_description
    }
    = req.body;

    try{
        if(!req.isAuth){
            const error = new Error("Unauthorised access, Login to continue")
            error.code = 401;
            throw error;
        }

        const userInformation = await La_clients_account_information_model.findById(req.userId)

        if(!userInformation){
            const error = new Error("User not found")
            error.code = 404;
            throw error;
        }

        const updatedCategoryType = await La_Meal_Plan_Meals_Category_Type.findById(la_meal_plan_meals_category_type_id)

        if(!updatedCategoryType){
            const error = new Error("Category type not found")
            error.code = 404;
            throw error;
        }

        updatedCategoryType.la_meal_plan_meals_category_type_name = la_meal_plan_meals_category_type_name;

        updatedCategoryType.la_meal_plan_meals_category_type_description = la_meal_plan_meals_category_type_description;

        updatedCategoryType.la_meal_plan_meals_category_type_updated_at = Date.now();   

        const savedCategoryType = await updatedCategoryType.save();

        res.status(200).json({
            status: 200,
            message: "Category type updated successfully",
            data: savedCategoryType
        })
    }
    catch(error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

exports.La_Delete_Category_Type_Controller = async function (req, res, next) {
    const { la_meal_plan_meals_category_type_id } = req.params;

    try{
        if(!req.isAuth){
            const error = new Error("Unauthorised access, Login to continue")
            error.code = 401;
            throw error;
        }

        const userInformation = await La_clients_account_information_model.findById(req.userId)

        if(!userInformation){
            const error = new Error("User not found")
            error.code = 404;
            throw error;
        }

        const deletedCategoryType = await La_Meal_Plan_Meals_Category_Type.findById(la_meal_plan_meals_category_type_id)

        if(!deletedCategoryType){
            const error = new Error("Category type not found")
            error.code = 404;
            throw error;
        }

        await deletedCategoryType.findOneAndDelete({
            _id: la_meal_plan_meals_category_type_id
        })

        res.status(200).json({
            status: 200,
            message: "Category type deleted successfully",
        })

    }
    catch(error) {
        res.json({ message: error.message, status: error.code })
        next()
    }
}

