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
  },
  votes: [{ 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'Vote'
   }],
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
  }],
  votes: [{ 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'Vote'
   }],
});

const voteSchema = new mongoose.Schema({
  link: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Link', required: true },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', required: true },
  },
 {
  timestamps: true,
  index: 
  { unique: true, 
    fields: { link: 1, user: 1 } },
  });
const Link = mongoose.model('Link', linkSchema, 'myLink');
const User = mongoose.model('User', userSchema, 'myUser');
const Vote = mongoose.model('Vote', voteSchema, 'myVote');

module.exports = { Link, User, Vote };
