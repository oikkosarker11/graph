const mongoose = require('mongoose');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const typeDefs = require('./schema.graphql');
const { Link, User } = require('./mongoSchema');
const { APP_SECRET } = require("./auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    feed: async () => {
      return await Link.find();
    },
    me: async (parent, args, context) => {
      if (context.currentUser === null) {
        throw new Error("Unauthenticated!");
      }

      try {
        // Assuming currentUser contains the user ID
        const user = await User.findById(context.currentUser.id);
        if (!user) {
          throw new Error("User not found");
        }
        return user;
      } catch (error) {
        throw new Error("Error fetching user");
      }
    },
  },

  Mutation: {
    post: async (parent, args, context) => {
      if (!context.currentUser) {
        throw new Error("Unauthenticated!");
      }

      try {
        // Create a new link (post)
        const newLink = new Link({
          url: args.url,
          description: args.description,
          postedBy: context.currentUser.id, // Assuming currentUser has an 'id' field
        });

        // Save the new link to the database
        await newLink.save();

        return newLink; // Return the newly created link
      } catch (error) {
        throw new Error("Failed to create post");
      }
    },

    signup: async (parent, args, context) => {
      try {
        // 1. Hash the password
        const password = await bcrypt.hash(args.password, 10);

        // 2. Create a new user in MongoDB
        const user = new User({
          name: args.name,
          email: args.email,
          password: password,
        });
        await user.save();

        // 3. Generate a JWT token
        const token = jwt.sign({ userId: user._id }, APP_SECRET);

        // 4. Return token and user
        return {
          token,
          user,
        };
      } catch (error) {
        throw new Error("Error signing up: " + error.message);
      }
    },

    login: async (parent, args, context) => {
      try {
        // 1. Find the user by email
        const user = await User.findOne({ email: args.email });
        if (!user) {
          throw new Error("No such user found");
        }

        // 2. Validate the password
        const valid = await bcrypt.compare(args.password, user.password);
        if (!valid) {
          throw new Error("Invalid password");
        }

        // 3. Generate a JWT token
        const token = jwt.sign({ userId: user._id }, APP_SECRET);

        // 4. Return token and user
        return {
          token,
          user,
        };
      } catch (error) {
        throw new Error("Error logging in: " + error.message);
      }
    },
  },

  Link: {
    id: (parent) => parent.id,
    description: (parent) => parent.description,
    url: (parent) => parent.url,
    postedBy: async (parent, args, context) => {
      if (!parent.postedById) {
        return null;
      }

      try {
        // Assuming parent.postedById refers to the user who posted the link
        const user = await User.findById(parent.postedById);
        return user; // Return the user who posted the link
      } catch (error) {
        throw new Error("Error fetching the user who posted the link");
      }
    },
  },

  User: {
    links: async (parent, args, context) => {
      try {
        // Assuming parent.id refers to the ID of the user
        const links = await Link.find({ postedById: parent.id }); // Querying links posted by the user
        return links;
      } catch (error) {
        throw new Error("Error fetching links for user");
      }
    },
  },
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

module.exports = schema;
