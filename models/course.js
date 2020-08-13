let mongoose = require('mongoose');

//Article Schema
let courseSchema = mongoose.Schema({
  title:{
    type: String,
    required: true
  },
  category:{
    type: String,
    required: true
  },
  description:{
    type: String,
    required: true
  },
  author:{
    type: String,
    required: true
  },
  authname:{
    type: String,
    required: true
  },
  lessons:[{
    lesson_number: {type: Number},
    lesson_title: {type: String},
    lesson_body: {type: String}
  }],
  comments:[],
  likes:[]
});

let Course = module.exports = mongoose.model('Course', courseSchema);

//fetch all courses
module.exports.getClasses = function(callback, limit){
  Class.find(callback).limit(limit);
}

//fetch single course
module.exports.getClassById = function(id, callback){
  Class.findById(id, callback);
}
