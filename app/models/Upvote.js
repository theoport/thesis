const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const upvoteSchema = new Schema({
	userId : 		{type: String, required: true},
	topicId : 	{type: String, required: true}
});

module.exports = mongoose.model('Upvote', upvoteSchema);
