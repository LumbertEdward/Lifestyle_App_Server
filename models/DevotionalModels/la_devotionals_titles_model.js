const mongoose = require('mongoose');
const Schema = mongoose.Schema

const la_devotionals_titles_schema = new Schema({
    la_devotionals_title: {
        type: String,
        required: false,
        trim: true
    },
    la_devotionals_author: {
        type: String,
        required: false,
        trim: true
    },
    la_devotionals_topic_id: {
        type: Schema.Types.ObjectId,
        required: false,
        trim: true
    },
    la_devotionals_verses: [
        {
            type: String,
            required: false,
            trim: true
        }
    ],
    la_devotionals_title_content: {
        la_devotional_sermon_audio_url: {
            type: String,
            required: false,
            trim: true
        },
        la_devotional_sermon_author: {
            type: String,
            required: false,
            trim: true
        },
        la_devotional_sermon_content: {
            type: String,
            required: false,
            trim: true
        },
        la_devotional_sermon_image: {
            type: String,
            required: false,
            trim: true
        },
        la_devotional_sermon_video_url: {
            type: String,
            required: false,
            trim: true
        }
    },
    la_devotionals_created_at: {
        type: Date,
        required: false,
        trim: true
    },
    la_devotionals_updated_at: {
        type: Date,
        required: false,
        trim: true
    },
    la_devotionals_deleted_at: {
        type: Date,
        required: false,
        trim: true
    }
}, {timestamps: true})

module.exports = mongoose.model('la_devotionals_titles', la_devotionals_titles_schema)