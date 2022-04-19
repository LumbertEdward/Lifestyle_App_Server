const mongoose = require('mongoose')
const Schema = mongoos.Schema

const la_daily_bible_verses_schema = new Schema({
    la_daily_bible_verses_date: {
        type: Date,
        required: false,
        trim: true
    },
    la_daily_bible_verses_verse: {
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