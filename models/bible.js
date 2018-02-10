var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bibleSchema = new Schema({
    _id: [Schema.Types.ObjectId],
    book: String,
    chapter: String,
    verse: String,
    content: String,
    tag: [String]
}, { collection: 'bible_kor' });

module.exports = mongoose.model('bible', bibleSchema);