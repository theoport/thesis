const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const bugSchema= new Schema({
	description: 							{type: String, 	required: true},
	updateId: 								{type: String,	required:true},
	bugId:		{type: String, required: true}
});

module.exports = mongoose.model('Bug', bugSchema);



