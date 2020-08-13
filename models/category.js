let mongoose = require('mongoose');

//Article Schema
let categorySchema = mongoose.Schema({
  cname:{
    type: String,
    required: true
  }
});

let Category = module.exports = mongoose.model('Category', categorySchema);
