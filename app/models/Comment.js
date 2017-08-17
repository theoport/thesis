const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
	topicId:			{type: Number, 	required: true},
	userId:				{type: Number, 	required: true}, 
	creationDate:	{type: Date, 		required: true},
	content:			{type: String, 	required: true}
});

module.exports = mongoose.model('Comment', commentSchema);
