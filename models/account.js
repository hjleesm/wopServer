var mongoose = require('mongoose');
var bcrypt   = require("bcrypt-nodejs");

var Schema = mongoose.Schema;

var accountSchema = new Schema({
    id: String,
    password: String,
    email: String,
    score: Number
}, { collection: 'account' });

accountSchema.pre('save', function(next) {
    if (this.isModified()) {
        this.password = bcrypt.hashSync(this.password);
    }

    return next();
});

accountSchema.methods.authenticate = function(password, callback) {
    if(bcrypt.compareSync(password, this.password)) {
        callback(null, true);
    } else {
        callback('error');
    }
};

module.exports = mongoose.model('account', accountSchema);