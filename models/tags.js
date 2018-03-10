var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tagSchema = new Schema({
    date: Date,
    book: String,
    chapter: String,
    verse: String,
    id: String,
    tag: String,
    action: String
}, { collection: 'tag_history' });

module.exports = mongoose.model('tag', tagSchema);