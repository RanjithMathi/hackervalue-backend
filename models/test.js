var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TestSchema = new Schema({
  name:String,
  createdBy:String,
  createdDate:Date,
});


module.exports = mongoose.model('Test', TestSchema);
