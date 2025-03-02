// import mongoose from "mongoose";
const mongoose=require('mongoose')
const {Link, User} = require('./mongoSchema');
const {authenticateUser} = require("./auth");


async function connectDB() {
  await mongoose.connect('mongodb://localhost/graphMore')
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
  };
}
module.exports= {connectDB, contextFactory}
