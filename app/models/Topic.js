const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const topicSchema = new Schema({
  tokenId:        {type: String, required: true},
  categoryId:     {type: String, required: true},
  userId:         {type: String, required: true},
  title:          {type: String, required: true},
  creationDate:   {type: Date, required: true},
  description:    {type: String, required: true},
});

module.exports = mongoose.model('Topic', topicSchema);

