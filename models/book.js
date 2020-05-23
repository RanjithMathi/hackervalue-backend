var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var random = require('mongoose-random');

var QuestionsSchema = new Schema({
  quizTitle :String,
  duration:String,
  questions:String,
  questionLines:String,
  answer:[],
  choices:[]
});

QuestionsSchema.plugin(random, { path: 'r' }); 

module.exports = mongoose.model('QuestionDetails', QuestionsSchema);
