// import mongoose from "mongoose";
const mongoose=require('mongoose')

async function connectDB() {
  await mongoose.connect('mongodb://localhost/graphQl')
  .then(() => {
      console.log(`Connected with Server ${'\n'}`);
  })
  .catch((err) => {
      console.log(err);
  });
} module.exports= connectDB
