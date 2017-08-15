const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
	postTopicId:	{type: Number, 	required: true},
	postById:			{type: Number, 	required: true}, 
	dateCreated:	{type: Date, 		required: true},
	content:			{type: String, 	required: true}
});

