var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var accountSchema = new Schema({
    id: String,
    password: String,
    email: String,
    score: Number
}, { collection: 'account' });

module.exports = mongoose.model('account', accountSchema);