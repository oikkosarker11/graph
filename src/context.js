// import mongoose from "mongoose";
const mongoose=require('mongoose')
const {Link, User, Vote} = require('./mongoSchema');
const {authenticateUser} = require("./auth");
const pubSub = require('./pubsub')


async function connectDB() {
  await mongoose.connect('mongodb://localhost/graphTest')
  .then(() => {
      console.log(`Connected with Server ${'\n'}`);
  })
  .catch((err) => {
      console.log(err);
  });
} 
async function contextFactory(request) {
  return {
    currentUser: await authenticateUser(request),
    pubSub
  };
}
module.exports= {connectDB, contextFactory}
