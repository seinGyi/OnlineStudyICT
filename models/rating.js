let mongoose = require('mongoose');

//Article Schema
let ratingSchema = mongoose.Schema({
  courseid:{
    type: String,
    required: true
  },
  users:[],
  totalstars:{
    type: Number
  }
});

let Rating = module.exports = mongoose.model('Rating', ratingSchema);
