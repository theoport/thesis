const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const bountyDescriptionSchema = new Schema ({
  description: 							{type: String, 	required: true},
  updateId: 								{type: String,	required:true},
  bountyId:									{type: String, required: true}
});

module.exports = mongoose.model('BountyDescription', bountyDescriptionSchema);


