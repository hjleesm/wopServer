var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var accountSchema = new Schema({
    _id: [Schema.Types.ObjectId],
    id: String,
    password: String,
    email: String,
    score: number
}, { collection: 'account' });

module.exports = mongoose.model('account', accountSchema);