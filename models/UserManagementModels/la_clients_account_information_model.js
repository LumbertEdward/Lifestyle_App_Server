const mongoose = require('mongoose')
const Schema = mongoose.Schema

const la_clients_account_information_schema = new Schema({
    la_client_username: {
        type: String,
        required: false,
        trim: true
    },
    la_client_first_name: {
        type: String,
        required: false,
        trim: true
    },
    la_client_middle_name: {
        type: String,
        required: false,
        trim: true
    },
    la_client_last_name: {
        type: String,
        required: false,
        trim: true
    },
    la_client_email_address: {
        type: String,
        required: false,
        trim: true
    },
    la_client_password: {
        type: String,
        required: false,
        trim: true
    },
    la_client_account_pin: {
        type: String,
        required: false,
        trim: true
    },
    la_client_phone_number: {
        type: String,
        required: false,
        trim: true
    },
    la_client_date_of_birth: {
        type: String,
        required: false,
        trim: true
    },
    la_client_gender: {
        type: String,
        required: false,
        trim: true
    },
    la_client_identification_type: {
        type: String,
        required: false,
        trim: true
    },
    la_client_identification_number: {
        type: String,
        required: false,
        trim: true
    },
    la_client_identification_country_of_issue: {
        type: String,
        required: false,
        trim: true
    },
    la_client_address_information: {
        la_client_country: {
            type: String,
            required: false,
            trim: true
        },
        la_client_city: {
            type: String,
            required: false,
            trim: true
        },
        la_client_state: {
            type: String,
            required: false,
            trim: true
        },
        la_client_postal_code: {
            type: String,
            required: false,
            trim: true
        },
        la_client_address_one: {
            type: String,
            required: false,
            trim: true
        },
        la_client_address_two: {
            type: String,
            required: false,
            trim: true
        },
    },
    la_client_verification_code: {
        type: String,
        required: false,
        trim: true
    },
    la_client_verification_code_expiry_at: {
        type: Date,
        required: false,
        trim: true
    },
    la_client_reset_code: {
        type: String,
        required: false,
        trim: true
    },
    la_client_reset_code_expiry_at: {
        type: Date,
        required: false,
        trim: true
    },
    la_client_pin_reset_code: {
        type: String,
        required: false,
        trim: true
    },
    la_client_pin_reset_code_expiry_date: {
        type: Date,
        required: false,
        trim: true
    },
    la_client_is_verified: {
        type: Boolean,
        required: false,
        trim: true
    },
    la_client_is_locked: {
        type: Boolean,
        required: false,
        trim: true
    },
    la_client_created_at: {
        type: Date,
        required: false,
        trim: true
    },
    la_client_updated_at: {
        type: Date,
        required: false,
        trim: true
    },
    la_client_deleted_at: {
        type: Date,
        required: false,
        trim: true
    },
    la_client_bible_verses: [
        {
            type: Schema.Types.ObjectId,
            ref: 'la_daily_bible_verses',
            required: false
        }
    ],
    la_client_daily_quotes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'la_daily_quotes',
            required: false
        }
    ],
    la_client_devotional: [
        {
            type: Schema.Types.ObjectId,
            ref: 'la_devotionals',
            required: false
        }
    ],
    la_client_poems: [
        {
            type: Schema.Types.ObjectId,
            ref: 'la_poems',
            required: false
        }
    ],
    la_client_meal_plans: [
        {
            type: Schema.Types.ObjectId,
            ref: 'la_meal_plan_information',
            required: false
        }
    ],
    la_client_workout_plans: [
        {
            type: Schema.Types.ObjectId,
            ref: 'la_work_out_plan',
            required: false
        }
    ],
    la_client_profile_completed: {
        type: Boolean,
        required: false,
        trim: true
    }
}, {timestamps: true})

module.exports = mongoose.model('la_clients_account_information', la_clients_account_information_schema)