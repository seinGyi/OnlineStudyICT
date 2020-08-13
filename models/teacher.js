const mongoose = require('mongoose');

//Teacher Schema
const TeacherSchema = mongoose.Schema({
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

const Teacher = module.exports = mongoose.model('Teacher', TeacherSchema);
