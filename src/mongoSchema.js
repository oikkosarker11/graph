const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  links: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link'
  }]
});
const Link = mongoose.model('Link', linkSchema, 'myLink');
const User = mongoose.model('User', userSchema, 'myUser');

module.exports = { Link, User };
