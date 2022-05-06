const mongoose = require('mongoose')
const Schema = mongoose.Schema

const la_daily_bible_verses_schema = new Schema({
    la_client_id: {
        type: String,
        required: false,
        trim: true
    },
    la_daily_bible_verses_verse: {
        type: String,
        required: false,
        trim: true
    },
    la_daily_bible_verses_chapter: {
        type: Date,
        required: false,
        trim: true
    },
    la_daily_bible_version: {
        type: String,
        required: false,
        trim: true
    },
    la_daily_bible_verses_feeling: {
        type: String,
        required: false,
        trim: true
    },
    la_daily_bible_verses_created_at: {
        type: Date,
        required: false,
        trim: true
    },
    la_daily_bible_verses_updated_at: {
        type: Date,
        required: false,
        trim: true
    },
    la_daily_bible_verses_deleted_at: {
        type: Date,
        required: false,
        trim: true
    }

}, {timestamps: true})

module.exports = mongoose.model('la_daily_bible_verses', la_daily_bible_verses_schema)