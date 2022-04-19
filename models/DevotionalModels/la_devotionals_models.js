const mongoose = require('mongoose')
const Schema = mongoose.Schema

const la_devotionals_schema = new Schema({
    la_devotionals_topic: {
        type: String,
        required: false,
        trim: true
    },
    la_devotionals_titles: [
        {
            type: Schema.Types.ObjectId,
            ref: 'la_devotionals_titles',
            required: false
        }
    ],
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

module.exports = mongoose.model('la_devotionals', la_devotionals_schema)