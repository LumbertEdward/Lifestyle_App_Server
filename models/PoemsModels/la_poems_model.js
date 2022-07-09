const mongoose = require('mongoose')
const Schema = mongoose.Schema

const la_poems_schema = new Schema({
    la_client_id: {
        type: String,
        required: false,
        trim: true
    },
    la_poems_topic: {
        type: String,
        required: false,
        trim: true
    },
    la_poems_title: {
        type: String,
        required: false,
        trim: true
    },
    la_poems_author: {
        type: String,
        required: false,
        trim: true
    },
    la_poems_content: {
        type: String,
        required: false,
        trim: true
    },
    la_poems_likes: {
        type: String,
        required: false,
        trim: true
    },
    la_poems_dislikes: {
        type: String,
        required: false,
        trim: true
    },
    la_poems_created_at: {
        type: Date,
        required: false,
        trim: true
    },
    la_poems_updated_at: {
        type: Date,
        required: false,
        trim: true
    },
    la_poems_deleted_at: {
        type: Date,
        required: false,
        trim: true
    }

}, {timestamps: true})

module.exports = mongoose.model('la_poems', la_poems_schema)