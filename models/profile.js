let mongoose = require('mongoose');

//Profile Pic Schema
let profileSchema = mongoose.Schema({
  author:{
    type: String,
    required: true
  },
  propic:{
    data: Buffer,
    type: String,
    required: true
  }
});

let Profile = module.exports = mongoose.model('Profile', profileSchema);
