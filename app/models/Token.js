const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
	id: 								{type: String,	required: true},
	name: 							{type: String, 	required: true},
	creator: 						{type: String, 	required: true},
	address: 						{type: String, 	required: true},
	managerAddress:			{type: String, 	required: true},
	creationDate: 			{type: Date, 		required: true},
	previousAddress:	 	{type: String, 	required: true},
	description: 				{type: String, 	required: false},
	sourceCode: 				{type: String, 	required: true}
});

module.exports = mongoose.model('Token', tokenSchema);

