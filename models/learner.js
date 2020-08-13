const mongoose = require('mongoose');

//Learner Schema
const LearnerSchema = mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true
  },
  username:{
    type: String,
    required: true
  },
  type:{
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true
  },
  photo:{
    type: String
  }
});

const Learner = module.exports = mongoose.model('Learner', LearnerSchema);
