const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const la_daily_quotes_schema = new Schema({
    la_client_id: {
        type: String,
        required: false,
        trim: true
    },
    la_daily_quotes_quote: {
        type: String,
        required: false,
        trim: true
    },
    la_daily_quotes_author: {
        type: String,
        required: false,
        trim: true
    },
    la_daily_quotes_category: {
        type: String,
        required: false,
        trim: true
    },
    la_daily_quotes_source: {
        type: String,
        required: false,
        trim: true
    },
    la_daily_quotes_created_at: {
        type: Date,
        required: false,
        trim: true
    },
    la_daily_quotes_updated_at: {
        type: Date,
        required: false,
        trim: true
    },
    la_daily_quotes_deleted_at: {
        type: Date,
        required: false,
        trim: true
    }

}, {timestamps: true});

module.exports = mongoose.model('la_daily_quotes', la_daily_quotes_schema)