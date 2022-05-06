const mongoose = require('mongoose')
const Schema = mongoose.Schema

const la_work_out_plan_schema = new Schema({
    la_client_id: {
        type: String,
        required: false,
        trim: true
    },
    la_work_out_plan_type: {
        type: String,
        required: false,
        trim: true
    },
    la_work_out_plan_body_goals: {
        type: String,
        required: false,
        trim: true
    },
    la_work_out_plan_days: {
        type: String,
        required: false,
        trim: true
    },
    la_work_out_plan_body_types: [
        {
            type: String,
            required: false,
            trim: true
        }
    ],
    la_work_out_plan_created_at: {
        type: Date,
        required: false,
        trim: true
    },
    la_work_out_plan_updated_at: {
        type: Date,
        required: false,
        trim: true
    },
    la_work_out_plan_deleted_at: {
        type: Date,
        required: false,
        trim: true
    }
    
}, {timestamps: true})

module.exports = mongoose.model('la_work_out_plan', la_work_out_plan_schema)