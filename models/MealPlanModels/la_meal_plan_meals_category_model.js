const mongoose = require('mongoose')
const Schema = mongoose.Schema

const la_meal_plan_meals_category_schema = new Schema({
    la_meal_plan_meals_category_name: {
        type: String,
        required: false,
        trim: true
    },
    la_meal_plan_meals_category_meal_name: [
        {
            type: Schema.Type.ObjectId,
            ref: 'la_meal_plan_meals_category_type',
            required: false
        }
    ],
    la_meal_plan_meals_category_created_at: {
        type: Date,
        required: false,
        trim: true
    },
    la_meal_plan_meals_category_updated_at: {
        type: Date,
        required: false,
        trim: true
    },
    la_meal_plan_meals_category_deleted_at: {
        type: Date,
        required: false,
        trim: true
    }
}, {timestamps: true})

module.exports = mongoose.model('la_meal_plan_meals_category', la_meal_plan_meals_category_schema)