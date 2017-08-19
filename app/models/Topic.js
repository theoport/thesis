const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const topicSchema = new Schema({
	categoryId: 				{type: String, 	required: true},
	userId: 						{type: String, 	required: true},
	title:							{type: String, 	required: true},
	creationDate: 			{type: Date, 		required: true},
	description: 				{type: String, 	required: false},
});

module.exports = mongoose.model('Topic', topicSchema);

