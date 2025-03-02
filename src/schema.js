// import { makeExecutableSchema } from "@graphql-tools/schema";
// import 'graphql-import-node';
// import mongoose from "mongoose";
// import mongoSchema from "./mongoSchema.js";
// import typeDefs from "./schema.graphql";
const mongoose = require('mongoose');
const  {makeExecutableSchema}  = require('@graphql-tools/schema');
const typeDefs = require('./schema.graphql')
const mongoSchema = require('./mongoSchema');

const Link = mongoose.model('Link', mongoSchema, 'myGraph');

const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    feed: async () => {
      return await Link.find();
    },
  },
  Mutation: {
    post: async (_, { url, description }) => {
      const newLink = new Link({ url, description });
      await newLink.save();
      return newLink;
    },
  },
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
module.exports= schema