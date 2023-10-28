const mongoose = require('mongoose')
const shortId = require('shortid')


const zipUrlSchema = new mongoose.Schema({
    full: {
        type: String,
        required: true
       },
    short: {
        type: String,
        required: true,
        default: shortId.generate().substring(0,5)
    },
    clicks: {
        type: Number,
        required: true,
        default: 0
    }
})

module.exports = mongoose.model('zipurl', zipUrlSchema)