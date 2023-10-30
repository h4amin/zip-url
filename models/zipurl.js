// const mongoose = require('mongoose');
// const shortId = require('shortid');

// const zipUrlSchema = new mongoose.Schema({
//   full: {
//     type: String,
//     required: true,
//   },
//   short: {
//     type: String,
//     required: true,
//     default: shortId.generate().substring(0, 5),
//   },
//   clicks: {
//     type: Number,
//     required: true,
//     default: 0,
//   },
//   // Add a user identifier field to associate URLs with users
//   userIdentifier: {
//     type: String,
//     required: true,
//   },
// });

// module.exports = mongoose.model('zipurl', zipUrlSchema);


const mongoose = require('mongoose');
const crypto = require('crypto'); // Node.js crypto library

const zipUrlSchema = new mongoose.Schema({
    full: {
        type: String,
        required: true,
    },
    short: {
        type: String,
        unique: true,
    },
    clicks: {
        type: Number,
        required: true,
        default: 0,
    },
    userIdentifier: {
        type: String,
        required: true,
    },
});

zipUrlSchema.pre('save', function (next) {
    // Generate a unique short URL based on userIdentifier and full URL
    const dataToHash = this.userIdentifier + this.full;
    const hash = crypto.createHash('md5').update(dataToHash).digest('hex');
    this.short = hash.substring(0, 5); // Use a portion of the hash as the short URL
    next();
});

module.exports = mongoose.model('zipurl', zipUrlSchema);
