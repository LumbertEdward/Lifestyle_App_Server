const mongoose = require('mongoose');
const Schema = mongoose.Schema

const la_user_account_information_schema = new Schema({
    la_user_account_information_type: {
        type: Boolean,
        required: false,
        trim: true,
        default: false
    },
    la_user_username: {
        type: String,
        required: false,
        trim: true
    },
    la_user_first_name: {
        type: String,
        required: false,
        trim: true
    },
    la_user_last_name: {
        type: String,
        required: false,
        trim: true
    },
    la_user_last_name: {
        type: String,
        required: false,
        trim: true
    },
    la_user_gender: {
        type: String,
        required: false,
        trim: true
    },
    la_user_email_address: {
        type: String,
        required: false,
        trim: true
    },
    la_user_account_password: {
        type: String,
        required: false,
        trim: true
    },
    la_user_date_of_birth: {
        type: String,
        required: false,
        trim: true
    },
    la_user_phone_number: {
        type: String,
        required: false,
        trim: true
    },
    la_user_identification_type: {
        type: String,
        required: false,
        trim: true
    },
    la_user_identification_number: {
        type: String,
        required: false,
        trim: true
    },
    la_user_identification_country_of_issue: {
        type: String,
        required: false,
        trim: true
    },
    la_user_diet_type: {
        type: String,
        required: false,
        trim: true
    },
    la_user_current_health_condition: {
        type: String,
        required: false,
        trim: true
    },
    la_user_is_disabled_or_having_a_health_condition: {
        type: Boolean,
        required: false,
        trim: true,
    },
    la_user_disability_or_health_condition_details: {
        type: String,
        required: false,
        trim: true
    },
    la_user_account_verification_code: {
        type: String,
        required: false,
        trim: true
    },
    la_user_number_of_eat_times: {
        type: String,
        required: false,
        trim: true
    },
    la_user_meal_taken_details: {
        type: String,
        required: false,
        trim: true
    },
    la_user_account_verification_code_expiry_date: {
        type: Date,
        required: false,
        trim: true
    },
    la_user_account_pin: {
        type: String,
        required: false,
        trim: true
    },
    la_user_account_reset_code: {
        type: String,
        required: false,
        trim: true
    },
    la_user_account_reset_code_expiry_date: {
        type: Date,
        required: false,
        trim: true
    },
    la_user_account_information_is_verified: {
        type: Boolean,
        required: false,
        trim: true
    },
    la_user_account_information_is_locked: {
        type: Boolean,
        required: false,
        trim: true
    },
    la_user_account_information_created_at: {
        type: Date,
        required: false,
        trim: true
    },
    la_user_account_information_updated_at: {
        type: Date,
        required: false,
        trim: true
    },
    la_user_account_information_deleted_at: {
        type: Date,
        required: false,
        trim: true
    },
    la_user_address_information: {
        la_user_country: {
            type: String,
            required: false,
            trim: true
        },
        la_user_city: {
            type: String,
            required: false,
            trim: true
        },
        la_user_state: {
            type: String,
            required: false,
            trim: true
        },
        la_user_postal_code: {
            type: String,
            required: false,
            trim: true
        },
        la_user_address_one: {
            type: String,
            required: false,
            trim: true
        },
        la_user_address_two: {
            type: String,
            required: false,
            trim: true
        },
    },
    la_user_account_information_meal_plans: [
        {
            type: Schema.Types.ObjectId,
            ref: 'la_meal_plan_information',
            required: false,
        }
    ]

}, {timestamps: true})

module.exports = mongoose.model('la_user_account_information', la_user_account_information_schema)