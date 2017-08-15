const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
	name:	{type: Number, 	required: true},
	password:			{type: Number, 	required: true}, 
	dateCreated:	{type: Date, 		required: true},
	content:			{type: String, 	required: true}
});

