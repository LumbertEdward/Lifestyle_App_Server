const mongoose = require('mongoose')
const Schema = mongoose.Schema

const la_user_address_information_Schema = new Schema({
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
    la_user_account_information: {
        type: Schema.Types.ObjectId,
        ref: 'la_user_account_information',
        required: false
    },
    la_user_address_information_created_at: {
        type: Date,
        required: false,
        trim: true
    },
    la_user_address_information_updated_at: {
        type: Date,
        required: false,
        trim: true
    },
    la_user_address_information_deleted_at: {
        type: Date,
        required: false,
        trim: true
    }

}, {timestamps: true})

module.exports = mongoose.model('la_user_address_information', la_user_address_information_Schema)