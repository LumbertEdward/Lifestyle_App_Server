const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const la_token_information_schema = new Schema({
    la_refresh_token: {
        type: String,
        required: false,
        trim: true
    },
    la_user_id: {
        type: String,
        required: false,
        trim: true
    }

})

module.exports = mongoose.model('la_token_information', la_token_information_schema)