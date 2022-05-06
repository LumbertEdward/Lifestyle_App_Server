const mongoose = require('mongoose')
const Schema = mongoose.Schema

const la_meal_plan_information_schema = new Schema({
    la_client_id: {
        type: String,
        required: false,
        trim: true
    },
    la_meal_plan_diet_type: {
        type: String,
        required: false,
        trim: true
    },
    la_meal_plan_maximum_age: {
        type: String,
        required: false,
        trim: true
    },
    la_meal_plan_minimum_age: {
        type: String,
        required: false,
        trim: true
    },
    la_meal_plan_body_goals: {
        type: String,
        required: false,
        trim: true
    },
    la_meal_plan_name: {
        type: String,
        required: false,
        trim: true
    },
    la_meal_plan_description: {
        type: String,
        required: false,
        trim: true
    },
    la_meal_plan_image_url: {
        type: String,
        required: false,
        trim: true
    },
    la_meal_plan_image_id: {
        type: String,
        required: false,
        trim: true
    },
    la_meal_plan_days: {
        type: String,
        required: false,
        trim: true
    },
    la_meal_plan_meals: [
        {
            type: Schema.Types.ObjectId,
            ref: 'la_meal_plan_meals',
            required: false
        }
    ],
    la_meal_plan_created_by: {
        type: Date,
        required: false,
        trim: true
    },
    la_meal_plan_updated_at: {
        type: Date,
        required: false,
        trim: true
    },
    la_meal_plan_deleted_at: {
        type: Date,
        required: false,
        trim: true
    }

}, {timestamps: true})

module.exports = mongoose.model('la_meal_plan_information', la_meal_plan_information_schema)