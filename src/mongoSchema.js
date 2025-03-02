// import mongoose from "mongoose";
const mongoose=require('mongoose')
const linkSchema = new mongoose.Schema({
  description: String,
  url: String,
});
 module.exports= linkSchema

