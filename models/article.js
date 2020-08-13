let mongoose = require('mongoose');

//Article Schema
let articleSchema = mongoose.Schema({
  title:{
    type: String,
    required: true
  },
  category:{
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
  authpic:{
    type: String
  },
  body:{
    type: String,
    required: true
  },
  date:{
    type: String
  },
  comments:[],
  likes:[]
});

let Article = module.exports = mongoose.model('Article', articleSchema);
