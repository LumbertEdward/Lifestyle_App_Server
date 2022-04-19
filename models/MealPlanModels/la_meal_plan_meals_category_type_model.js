const mongoose = require('mongoose')
const Schema = mongoose.Schema

const la_meal_plan_meals_category_type_schema = new Schema({
    la_meal_plan_meals_category_type_name: {
        type: String,
        required: false,
        trim: true
    },
    la_meal_plan_meals_category_type_description: {
        type: String,
        required: false,
        trim: true
    },
    la_meal_plan_meals_category_type_created_at: {
        type: Date,
        required: false,
        trim: true
    },
    la_meal_plan_meals_category_type_updated_at: {
        type: Date,
        required: false,
        trim: true
    },
    la_meal_plan_meals_category_type_deleted_at: {
        type: Date,
        required: false,
        trim: true
    }

}, {timestamps: true})

module.exports = mongoose.model('la_meal_plan_meals_category_type', la_meal_plan_meals_category_type_schema)