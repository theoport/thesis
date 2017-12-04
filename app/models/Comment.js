const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  topicId:      {type: String, 	required: true},
  userId:       {type: String, 	required: true}, 
  creationDate: {type: Date, 		required: true},
  content:      {type: String, 	required: true}
});

module.exports = mongoose.model('Comment', commentSchema);
