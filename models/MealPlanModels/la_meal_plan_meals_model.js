const mongoose = require('mongoose')
const Schema = mongoose.Schema

const la_meal_plan_meals_schema = new Schema({
    la_meal_plan_meals_day: {
        type: String,
        required: false,
        trim: true
    },
    la_meal_plan_meals_description: {
        type: String,
        required: false,
        trim: true
    },
    la_meal_plan_information_id: {
        type: Schema.Types.ObjectId,
        required: false,
        trim: true
    },
    la_meal_plan_meals_meal_category: [
        {
            type: Schema.Types.ObjectId,
            ref: 'la_meal_plan_meals_category',
            required: false
        }
    ],
    la_meal_plan_meals_created_at: {    
        type: Date,
        required: false,
        trim: true
    },
    la_meal_plan_meals_updated_at: {
        type: Date,
        required: false,
        trim: true
    },
    la_meal_plan_meals_deleted_at: {
        type: Date,
        required: false,
        trim: true
    }

}, {timestamps: true})

module.exports = mongoose.model('la_meal_plan_meals', la_meal_plan_meals_schema)