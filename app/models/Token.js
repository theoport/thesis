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
	sourceCode: 				{type: String, 	required: true},
	abi: 								{type: Object, 	required: true}
});
tokenSchema.pre('save', function(next) {

	for (var i = 0 ; i < this.abi.length ; i++) {
		if (this.abi[i].type == 'function') { 
			if (this.abi[i].payable == 'true') {
				this.abi[i].payable = true;
			}
			if (this.abi[i].payable == 'false') {
				this.abi[i].payable= false;
			}
			if (this.abi[i].constant == 'true') {
				this.abi[i].constant= true;
			}
			if (this.abi[i].constant == 'false') {
				this.abi[i].constant = false;
			}
			if (this.abi[i].outputs == undefined) {
				this.abi[i].outputs = [];
			}
			if (this.abi[i].inputs == undefined) {
				this.abi[i].inputs = [];
			}
		}
	}
	next();

});

module.exports = mongoose.model('Token', tokenSchema);

